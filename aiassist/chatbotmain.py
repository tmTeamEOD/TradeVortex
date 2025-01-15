#!/usr/bin/env python
import sys
import warnings

from aiassist.chatbot import ChatBotCrew

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

# This main file is intended to be a way for you to run your
# crew locally, so refrain from adding unnecessary logic into this file.
# Replace with inputs you want to test with, it will automatically
# interpolate any tasks and agents information

def response(inputs):
    """
    Run the crew with the provided inputs.
    """
    try:
        result = ChatBotCrew().chatbot_crew().kickoff(inputs=inputs)
        return result
    except Exception as e:
        raise Exception(f"An error occurred during crew execution: {e}")
