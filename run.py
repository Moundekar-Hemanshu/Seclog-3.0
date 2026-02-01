# run.py

import customtkinter as ctk
from main_app import SecurityLogApp
from modules.user_auth import UserAuthenticator
from ui_components import LoginWindow

class AppController:
    def __init__(self):
        ctk.set_appearance_mode("System")
        ctk.set_default_color_theme("dark-blue")

        # ONE root only
        self.root = ctk.CTk()
        self.root.withdraw()

        self.auth = UserAuthenticator()

        # Login window is a Toplevel
        self.login_window = LoginWindow(
            master=self.root,
            auth_instance=self.auth,
            on_success_callback=self.launch_main_app
        )

    def run(self):
        self.root.mainloop()

    def launch_main_app(self):
        # Close login window only
        self.login_window.destroy()

        # Main app as Toplevel
        SecurityLogApp(master=self.root)

if __name__ == "__main__":
    AppController().run()
