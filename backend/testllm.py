import os
import asyncio
import json
from pydantic import BaseModel, Field
from typing import List, Optional
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy
import google.generativeai as genai


class Product(BaseModel):
    name: str
    price: str


async def main():
    # 1. Define the LLM extraction strategy
    llm_strategy = LLMExtractionStrategy(
        provider="gemini/gemini-1.5-flash",  # Use google provider
        api_token="AIzaSyDCItVEkimIuwJk-z8slHzgG256VSsfBIA",
        schema=Product.schema_json(),  # Or use model_json_schema()
        extraction_type="schema",
        instruction="사이트 설명을 해줘.",
        chunk_token_threshold=1000,
        overlap_rate=0.0,
        apply_chunking=True,
        input_format="html",  # or "fit_markdown"
        extra_args={"temperature": 0.0, "max_tokens": 800} # choose model here
    )

    # 2. Build the crawler config
    crawl_config = CrawlerRunConfig(
        extraction_strategy=llm_strategy,
        cache_mode=CacheMode.BYPASS,
    )

    # 3. Create a browser config if needed
    browser_cfg = BrowserConfig(headless=True)

    async with AsyncWebCrawler(config=browser_cfg) as crawler:
        # 4. Let's crawl a single page with product listings
        result = await crawler.arun(
            url="https://www.naver.com/",  # Changed to an example product page
            config=crawl_config
        )

        if result.success:
            # 5. Now, safely attempt to parse JSON
            try:
                if result.extracted_content:  # Check if it's not empty
                    data = json.loads(result.extracted_content)
                    print("Extracted items:", data)
                else:
                    print("Extracted content was empty.")
            except json.JSONDecodeError:
                print("Error: Extracted content is not valid JSON")
                print("Raw output from LLM:", result.extracted_content)

            # 6. Show usage stats
            llm_strategy.show_usage()  # prints token usage
        else:
            print("Error:", result.error_message)


if __name__ == "__main__":
    asyncio.run(main())
