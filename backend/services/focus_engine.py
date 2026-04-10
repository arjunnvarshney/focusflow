class FocusEngine:
    def __init__(self):
        self.state = "ACTIVE"
        self.distractions = 0
        self.score = 100.0

    def start_session(self):
        self.state = "ACTIVE"
        self.distractions = 0
        self.score = 100.0

    def transition(self, event_type: str):
        if event_type in ["tab_switch", "idle"]:
            if self.state in ["ACTIVE", "RECOVERING"]:
                self.state = "DISTRACTED"
                self.distractions += 1
                self.score = max(0.0, self.score - 5.0)
        elif event_type == "resume":
            if self.state == "DISTRACTED": self.state = "RECOVERING"
            elif self.state == "RECOVERING": self.state = "ACTIVE"

    def get_summary_data(self):
        return {"count": self.distractions, "score": self.score}
