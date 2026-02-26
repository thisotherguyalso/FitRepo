# FitRepo

FitRepo is a cross-platform workout and nutrition tracking app built with **Expo** and **React Native**.  
It helps users manage workout plans, track exercises, and adjust diets whether they’re at the gym, at home, or playing sports.

---

## Features

-  Custom workout plan management  
-  Diet and calorie tracking  
-  Cross-platform (Android, iOS, Web)  
-  Built with Expo for rapid development  
-  File-based routing (Expo Router)
-  Built-in AI assistant

---

## Tech Stack

- React Native  
- Expo  
- Expo Router (file-based routing)  
- JavaScript / TypeScript  
- Node.js & npm  

---

##  Installation

### 1 Clone the repository

```bash
git clone <https://github.com/your-username/FitRepo.git>
cd FitRepo
cd fitrepo
```

### 2 Install dependencies

```bash
npm install
```

### 3 Start the development server

```bash
npx expo start
```

---

## Running the App

After running `npx expo start`, you can open the app using:

-  **Expo Go** (scan QR code)
-  **Android Emulator**
-  **iOS Simulator**
-  **Web browser**

Follow the prompts shown in your terminal.

---

## Project Structure

```
FitRepo/
|
└──fitrepo/
    │
    ├── app/                # Main application screens (file-based routing)
    ├── app-example/        # Starter template (after reset)
    ├── assets/             # Images, icons, fonts
    ├── components/         # Reusable UI components
    └── package.json
```

This project uses **file-based routing**, meaning routes are automatically created based on files inside the `app/` directory.

---

## Learning Resources

- https://docs.expo.dev/
- https://docs.expo.dev/router/introduction/
- https://docs.expo.dev/tutorial/introduction/

---

## License

This project is licensed under the MIT License.