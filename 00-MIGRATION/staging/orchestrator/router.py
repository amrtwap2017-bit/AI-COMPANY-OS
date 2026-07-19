class ModelRouter:

    def choose(self, task: str):

        if "code" in task.lower():
            return "qwen2.5-coder"

        if "vision" in task.lower():
            return "llava"

        return "llama3.2"