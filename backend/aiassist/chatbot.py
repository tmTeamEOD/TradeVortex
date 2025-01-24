from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
import os
from dotenv import load_dotenv
from crewai.knowledge.source.string_knowledge_source import StringKnowledgeSource

# .env 파일 로드 ㅇㅇㅇasd123
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)
else:
    raise FileNotFoundError(f".env 파일을 찾을 수 없습니다: {env_path}")

@CrewBase
class ChatBotCrew:
    """챗봇 전용 크루"""

    @agent
    def researcher(self) -> Agent:
        return Agent(
            role="입력 검토 챗봇",
            goal="{question}에 대해 대답 챗봇에게 전달합니다.",
            backstory="빠르게 전달합니다.",
            verbose=True
        )

    @agent
    def reporting_analyst(self) -> Agent:
        return Agent(
            role="금융 대답 챗봇",
            goal="입력 검토 챗봇의 정보를 바탕으로 사용자 친화적인 금융 관련 답변을 작성합니다.",
            backstory="입력 검토 챗봇의 금융 데이터를 활용하여 답변을 재구성합니다.",
            verbose=True
        )

    @task
    def research_task(self) -> Task:
        return Task(
            description="사용자의 금융 관련 질문 '{question}'에 대해 대답 챗봇에 빠르게 전달합니다.",
            expected_output="빠르고 정확한 전달",
            agent=self.researcher(),
        )

    @task
    def reporting_task(self) -> Task:
        """
        금융 챗봇 작업(Task) 정의
        """
        return Task(
            description="전달 받은 내용을 바탕으로 사용자 친화적인 금융 답변을 작성합니다.",
            expected_output="금융 관련 정보를 명확하고 친근하게 전달하는 내용을 마크 다운 언어로 100자 이내로 가독성이 뛰어나게 답변함",
            agent=self.reporting_analyst(),
        )

    @crew
    def chatbot_crew(self) -> Crew:
        """
        금융 전용 챗봇 크루 정의
        """
        # csv_file_path = "./financial_data.txt"  # 금융 데이터를 포함한 텍스트 파일 경로
        # file = open(csv_file_path, "r", encoding="utf-8")
        # file_content = file.read()
        # knowledge_source = StringKnowledgeSource(content=file_content)

        # Crew 초기화
        try:
            print("[DEBUG] Initializing Crew...")
            crew = Crew(
                agents=[self.researcher(), self.reporting_analyst()],
                tasks=[self.research_task(), self.reporting_task()],
                process=Process.sequential,  # 순차 처리로 작업 실행
                # memory=True,
                embedder={
                    "provider": "google",
                    "config": {
                        "api_key": "AIzaSyDCItVEkimIuwJk-z8slHzgG256VSsfBIA",
                        "model": "models/text-embedding-004"}}
                # knowledge_sources=[knowledge_source],
            )
            print("[DEBUG] Crew initialized successfully.")
        except Exception as e:
            print(f"[ERROR] An error occurred while initializing Crew: {e}")
            return None

        print("[DEBUG] Returning Crew object.")
        return crew
