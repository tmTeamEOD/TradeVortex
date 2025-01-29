from crewai import Agent, Crew, Process, Task, Tool
from crewai.project import CrewBase, agent, crew, task
from duckduckgo_search import DDGS
import os
from dotenv import load_dotenv

# .env 파일 로드
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)


# DuckDuckGo 검색 도구 정의
class DuckDuckGoSearch:
    """DuckDuckGo 검색을 수행하는 도구"""
    def search(self, query: str):
        with DDGS() as ddgs:
            results = ddgs.text(query, max_results=5)
            return "\n".join([res["title"] + " - " + res["href"] for res in results])

duckduckgo_tool = Tool(
    name="DuckDuckGo Search",
    description="Searches the web using DuckDuckGo.",
    func=DuckDuckGoSearch().search
)


@CrewBase
class MyCrew():
    """Crew crew"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    # 에이전트 정의
    @agent
    def researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['researcher'],
            tools=[duckduckgo_tool],  # DuckDuckGo 검색 추가
            verbose=True
        )

    @agent
    def reporting_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['reporting_analyst'],
            verbose=True
        )

    # 작업(Task) 정의
    @task
    def research_task(self) -> Task:
        return Task(
            config=self.tasks_config['research_task'],
        )

    @task
    def reporting_task(self) -> Task:
        return Task(
            config=self.tasks_config['reporting_task'],
            output_file='report.md'
        )

    # 크루 정의
    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,  # 자동 생성된 에이전트
            tasks=self.tasks,  # 자동 생성된 작업
            process=Process.sequential,
            verbose=True,
        )
