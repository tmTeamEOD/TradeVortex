import math
import torch
import torch.nn as nn
import numpy as np
from .models import Asset, OHLCV
from decimal import Decimal


########################################
# Positional Encoding (Transformer 공통)
########################################
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, dropout=0.1, max_len=5000):
        """
        Transformer에 사용되는 Positional Encoding 클래스
        """
        super(PositionalEncoding, self).__init__()
        self.dropout = nn.Dropout(p=dropout)

        # max_len x d_model 크기의 positional encoding 생성
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2, dtype=torch.float) * (-math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(1)
        self.register_buffer('pe', pe)

    def forward(self, x):
        """
        x: (seq_len, batch_size, d_model)
        """
        x = x + self.pe[:x.size(0), :, :]
        return self.dropout(x)


########################################
# Awesome Transformer 기반 예측 모델 정의
########################################
class AwesomeTransformerForecaster(nn.Module):
    def __init__(
            self,
            input_window,  # 입력 시퀀스 길이 (예: 30일)
            output_window,  # 출력(예측) 시퀀스 길이 (예: 7일)
            d_model=64,  # 임베딩 차원 (내부 모델 차원)
            nhead=8,  # 멀티헤드 어텐션 헤드 수
            num_encoder_layers=3,  # Transformer Encoder Layer 수
            num_decoder_layers=3,  # Transformer Decoder Layer 수
            dim_feedforward=128,  # FFN 내부 차원
            dropout=0.1
    ):
        super(AwesomeTransformerForecaster, self).__init__()
        self.input_window = input_window
        self.output_window = output_window
        self.d_model = d_model

        # 입력 종가(1차원)를 d_model 차원으로 사상
        self.input_projection = nn.Linear(1, d_model)

        # 인코더의 Positional Encoding
        self.encoder_pos_encoding = PositionalEncoding(d_model, dropout, max_len=input_window)

        # Transformer Encoder 구성
        encoder_layer = nn.TransformerEncoderLayer(d_model, nhead, dim_feedforward, dropout)
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_encoder_layers)

        # 디코더 입력으로 사용할 "출력 임베딩" (예측한 종가 값을 d_model 차원으로 변환)
        self.output_embedding = nn.Linear(1, d_model)

        # 디코더의 Positional Encoding (최대 output_window 길이)
        self.decoder_pos_encoding = PositionalEncoding(d_model, dropout, max_len=output_window + 1)

        # Transformer Decoder 구성
        decoder_layer = nn.TransformerDecoderLayer(d_model, nhead, dim_feedforward, dropout)
        self.transformer_decoder = nn.TransformerDecoder(decoder_layer, num_decoder_layers)

        # 디코더 초기 입력으로 사용할 시작 토큰 (learnable parameter)
        self.start_token = nn.Parameter(torch.zeros(1, 1, d_model))

        # 최종 출력: d_model 차원을 실제 종가(1차원)로 매핑
        self.output_projection = nn.Linear(d_model, 1)

    def generate_square_subsequent_mask(self, sz):
        """디코더의 self-attention 마스크 생성 (미래 토큰 참조 방지)"""
        mask = (torch.triu(torch.ones(sz, sz)) == 1).transpose(0, 1)
        mask = mask.float().masked_fill(mask == 0, float('-inf')).masked_fill(mask == 1, float(0.0))
        return mask

    def forward(self, src):
        """
        Inference 시, autoregressive하게 output_window 길이의 시퀀스를 생성합니다.
        src: (batch_size, input_window, 1) - 실제 종가 데이터
        반환: (batch_size, output_window) - 예측 종가 (실제 가격 단위)
        """
        batch_size = src.size(0)

        # 1. 인코더 입력 구성: (input_window, batch_size, d_model)
        src = self.input_projection(src).transpose(0, 1)  # (input_window, batch_size, d_model)
        src = self.encoder_pos_encoding(src)

        # 2. 인코더 통과
        memory = self.transformer_encoder(src)

        # 3. 디코더 초기 입력: 시작 토큰 (shape: (1, batch_size, d_model))
        decoder_inputs = self.start_token.repeat(1, batch_size, 1)

        # 디코더의 self-attention 마스크 (현재까지의 길이에 대해 생성)
        outputs = []

        for t in range(self.output_window):
            # 디코더 입력에 positional encoding 적용
            dec_inputs = self.decoder_pos_encoding(decoder_inputs)
            tgt_mask = self.generate_square_subsequent_mask(dec_inputs.size(0)).to(dec_inputs.device)

            # 디코더 통과: 현재까지의 출력(dec_inputs)와 인코더의 메모리(memory) 사용
            decoder_output = self.transformer_decoder(
                tgt=dec_inputs,
                memory=memory,
                tgt_mask=tgt_mask
            )
            next_price = self.output_projection(decoder_output[-1])
            outputs.append(next_price)

            next_emb = self.output_embedding(next_price).unsqueeze(0)
            decoder_inputs = torch.cat([decoder_inputs, next_emb], dim=0)

        forecast = torch.cat(outputs, dim=1)
        return forecast


########################################
# 하이퍼파라미터 정의 및 모델 인스턴스 생성
########################################
INPUT_WINDOW = 120  # 최근 30일의 종가 데이터 사용
OUTPUT_WINDOW = 14  # 향후 7일 예측
D_MODEL = 64  # Transformer 내부 차원
NHEAD = 8
NUM_ENCODER_LAYERS = 3
NUM_DECODER_LAYERS = 3
DIM_FEEDFORWARD = 128
DROPOUT = 0.1

# Awesome Transformer 모델 인스턴스 생성
model = AwesomeTransformerForecaster(
    input_window=INPUT_WINDOW,
    output_window=OUTPUT_WINDOW,
    d_model=D_MODEL,
    nhead=NHEAD,
    num_encoder_layers=NUM_ENCODER_LAYERS,
    num_decoder_layers=NUM_DECODER_LAYERS,
    dim_feedforward=DIM_FEEDFORWARD,
    dropout=DROPOUT
)

# 실제 서비스에서는 아래와 같이 학습 완료된 모델 파라미터를 로드하세요.
# model.load_state_dict(torch.load('path/to/awesome_transformer_forecaster.pth', map_location=torch.device('cpu')))
model.eval()  # 평가 모드로 전환


def add_volatility(forecast, volatility_factor=0.05):
    """
    예측값에 변동성을 추가하는 함수
    volatility_factor: 변동성을 조절하는 인자 (기본값 0.05)
    """
    forecast_with_volatility = []
    for val in forecast:
        volatility = val * volatility_factor * (np.random.rand() * 2 - 1)  # -1 ~ 1 사이의 랜덤 값
        forecast_with_volatility.append(val + volatility)
    return forecast_with_volatility

def predict_forecast(asset_symbol):
    """
    특정 자산의 최근 OHLCV 데이터를 기반으로 향후 7일의 실제 종가를 예측합니다.
    (모델이 변화량(delta)을 예측하는 경우)
    """
    try:
        asset = Asset.objects.get(symbol=asset_symbol)
    except Asset.DoesNotExist:
        raise ValueError(f"Asset with symbol '{asset_symbol}' does not exist.")

    # 2. 해당 자산의 OHLCV 데이터 가져오기 (날짜 오름차순 정렬)
    qs = OHLCV.objects.filter(asset=asset).order_by('date')
    if qs.count() < INPUT_WINDOW:
        raise ValueError(f"Not enough data for asset '{asset_symbol}'. Minimum {INPUT_WINDOW} records are required.")

    close_values = list(qs.values_list('close', flat=True))
    series = np.array(close_values[-INPUT_WINDOW:], dtype=np.float32)
    x = torch.tensor(series, dtype=torch.float32).unsqueeze(0).unsqueeze(-1)

    with torch.no_grad():
        forecast = model(x)

    last_close = float(close_values[-1])  # 마지막 실제 종가
    forecast = forecast.squeeze().cpu().numpy() + last_close

    # 예측에 변동성 추가
    forecast_with_volatility = add_volatility(forecast)

    # 후처리: 소수점 2자리까지 반올림하여 반환
    return {
        "asset": asset_symbol,
        "forecast": [Decimal(str(val)).quantize(Decimal('0.01')) for val in forecast_with_volatility]  # 소수점 2자리로 반환
    }
