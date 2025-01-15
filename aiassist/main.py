#!/usr/bin/env python
import sys
import warnings

from aiassist.crew import MyCrew

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

# This main file is intended to be a way for you to run your
# crew locally, so refrain from adding unnecessary logic into this file.
# Replace with inputs you want to test with, it will automatically
# interpolate any tasks and agents information

def run(inputs):
    """
    Run the crew with the provided inputs.
    """
    try:
        result = MyCrew().crew().kickoff(inputs=inputs)
        return result
    except Exception as e:
        raise Exception(f"An error occurred during crew execution: {e}")


def train(n_iterations, filename, inputs):
    """
    Train the crew for a given number of iterations.
    """
    try:
        MyCrew().crew().train(n_iterations=n_iterations, filename=filename, inputs=inputs)
        return "Crew trained successfully!"
    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")

def replay(task_id):
    """
    Replay the crew execution from a specific task.
    """
    try:
        MyCrew().crew().replay(task_id=task_id)
        return "Crew replayed successfully!"
    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")

def test(n_iterations, openai_model_name, inputs):
    """
    Test the crew execution and return the results.
    """
    try:
        result = MyCrew().crew().test(n_iterations=n_iterations, openai_model_name=openai_model_name, inputs=inputs)
        return result
    except Exception as e:
        raise Exception(f"An error occurred during crew test: {e}")
