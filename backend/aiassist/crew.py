import os
import yaml
import datetime
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from crewai.tools.base_tool import Tool
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from duckduckgo_search import DDGS

# .env 파일 로드
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)

# YAML 파일 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AGENTS_CONFIG_PATH = os.path.join(BASE_DIR, 'config', 'agents.yaml')
TASKS_CONFIG_PATH = os.path.join(BASE_DIR, 'config', 'tasks.yaml')

# 현재 날짜 가져오기
CURRENT_DATE = datetime.datetime.now().strftime("%Y-%m-%d")


# ✅ CrewAI에서 사용 가능한 DuckDuckGo 검색 툴
class DuckDuckGoSearchTool(BaseModel):
    """CrewAI에서 사용 가능한 DuckDuckGo 검색 툴"""

    name: str = Field(default="DuckDuckGo Search")
    description: str = Field(default="Search the web using DuckDuckGo and return top results.")
    max_results: int = Field(default=5)

    @staticmethod
    def func(*args, **kwargs) -> str:
        """CrewAI의 `args`, `kwargs`에서 DuckDuckGo 검색어(query)를 추출하여 실행."""
        query = None

        if "query" in kwargs and isinstance(kwargs["query"], str):
            query = kwargs["query"]
        elif args and isinstance(args[0], str):
            query = args[0]
        elif args and isinstance(args[0], dict):
            query = args[0].get("description", None)
        elif "args" in kwargs and isinstance(kwargs["args"], dict):
            query = kwargs["args"].get("description", None)

        if not query:
            return "⚠️ Error: No valid search query provided."

        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=5))

            if not results:
                return "🔍 No relevant results found."

            return "\n".join([f"{res['title']} - {res['href']}" for res in results])

        except Exception as e:
            return f"⚠️ Error: DuckDuckGo search failed - {str(e)}"


# ✅ CrewAI가 인식할 수 있도록 Tool 객체 생성
duckduckgo_instance = DuckDuckGoSearchTool()
duckduckgo_tool = Tool(
    name=duckduckgo_instance.name,
    description=duckduckgo_instance.description,
    func=duckduckgo_instance.func,
)


@CrewBase
class MyCrew:
    """Crew 정의"""

    def __init__(self):
        if not os.path.exists(AGENTS_CONFIG_PATH):
            raise FileNotFoundError(f"❌ 에이전트 설정 파일이 없습니다: {AGENTS_CONFIG_PATH}")
        if not os.path.exists(TASKS_CONFIG_PATH):
            raise FileNotFoundError(f"❌ 작업 설정 파일이 없습니다: {TASKS_CONFIG_PATH}")

        self.agents_config = self.load_yaml(AGENTS_CONFIG_PATH)
        self.tasks_config = self.load_yaml(TASKS_CONFIG_PATH)

        # YAML에서 {current_date} 변수를 치환
        self.inject_current_date()

        # CrewAI가 인식하는 Tool 적용
        self.duckduckgo_tool = duckduckgo_tool

    def load_yaml(self, path):
        """YAML 파일을 로드하는 함수"""
        with open(path, 'r', encoding='utf-8') as file:
            return yaml.safe_load(file)

    def inject_current_date(self):
        """현재 날짜를 YAML 설정에 자동으로 삽입"""
        for key in self.tasks_config:
            if isinstance(self.tasks_config[key], dict):
                for sub_key in self.tasks_config[key]:
                    if isinstance(self.tasks_config[key][sub_key], str):
                        self.tasks_config[key][sub_key] = self.tasks_config[key][sub_key].replace("{current_date}", CURRENT_DATE)

    # 3) 에이전트 정의
    @agent
    def researcher(self) -> Agent:
        return Agent(
            config=self.agents_config["researcher"],
            tools=[self.duckduckgo_tool],
            verbose=True
        )

    @agent
    def reporting_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config["reporting_analyst"],
            verbose=True
        )

    # 4) 작업(Task) 정의
    @task
    def research_task(self) -> Task:
        """현재 날짜를 명시적으로 포함하여 Task 생성"""
        description = self.tasks_config["research_task"]["description"].replace("{current_date}", CURRENT_DATE)
        expected_output = self.tasks_config["research_task"]["expected_output"].replace("{current_date}", CURRENT_DATE)

        return Task(
            description=description,
            expected_output=expected_output,
            agent=self.researcher()  # ✅ 에이전트 명시
        )

    @task
    def reporting_task(self) -> Task:
        """현재 날짜를 명시적으로 포함하여 Task 생성"""
        description = self.tasks_config["reporting_task"]["description"].replace("{current_date}", CURRENT_DATE)
        expected_output = self.tasks_config["reporting_task"]["expected_output"].replace("{current_date}", CURRENT_DATE)

        return Task(
            description=description,
            expected_output=expected_output,
            output_file='report.md',
            agent=self.reporting_analyst()  # ✅ 에이전트 명시
        )

    # 5) 크루 정의
    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
