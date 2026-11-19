<p align="center">
<img src="./web/src/assets/logo-nlw-esports@2x.png"/>
</p>

<div align="center">
   </br>
   <a href="#-technologies-used">
      <img alt="React" src="https://img.shields.io/badge/react%20-%2320232a.svg?&style=for-the-badge&logo=react&logoColor=%2361DAFB">
      <img alt="React Native" src="https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB">
      <img alt="Nodejs" src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white">
      <img alt="TypeScript" src="https://img.shields.io/badge/typescript%20-%23007ACC.svg?&style=for-the-badge&logo=typescript&logoColor=white">
      <img alt="TailwindCSS" src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white">
      <img alt="Vite" src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white">
      <img alt="Expo" src="https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37">
      <img alt="Prisma" src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white">
   </a>
</div>

## 📃 About

**NLW eSports** is a project developed from the ground up during the Ignite trail of **Next Level Week**, an online event produced by [**Rocketseat**](https://github.com/Rocketseat).
</br>
</br>
The project is an app that allows users to post an ad to find other players in the game they want.

## ✨ Features

- [x] List of games (web and mobile)
- [x] Creation of a new ad (web)
- [x] User feedback: loading during creation, success and error (web)
- [x] Ad listing (mobile)
- [x] Copy discord user to clipboard (mobile)

## 🚀 Technologies and tools used

<table>
   <tbody>
      <tr>
         <td style="font-weight: bold">Front-end on web</td>
         <td>
         <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a>,
         <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">TypeScript</a>,
         <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">Vite</a>,
         <a href="https://www.radix-ui.com/" target="_blank" rel="noopener noreferrer">RadixUI</a>,
         <a href="https://formik.org/" target="_blank" rel="noopener noreferrer" >Formik</a>,
         <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer">TailwindCSS</a> and 
         <a href="https://phosphoricons.com/" target="_blank" rel="noopener noreferrer" >Phosphor Icons</a> 
         </td>
      </tr>
      <tr>
         <td style="font-weight: bold">Front-end on mobile</td>
         <td>
          <a href="https://reactnative.dev/" target="_blank" rel="noopener noreferrer">React Native</a>
          and
          <a href="https://expo.dev/" target="_blank" rel="noopener noreferrer">Expo</a>
         </td>
      </tr>
      <tr>
         <td style="font-weight: bold">Back-end (web/mobile)</td>
         <td>
          <a href="https://nodejs.org/en/" target="_blank" rel="noopener noreferrer">NodeJs</a>
          and
          <a href="https://www.prisma.io/" target="_blank" rel="noopener noreferrer">Prisma</a>
         </td>
      </tr>
   </tbody>
</table>

## 🔧 Install and run

To download the source code of the project to your machine, you will first need to have [**GIT**](https://git-scm.com/) installed.

With GIT installed, in your terminal run the following command:

```bash
git clone https://github.com/Devssaurinho/nlw-esports.git
```

You will also need [**Node.js**](https://nodejs.org/en/) 22.12 or newer, which comes with NPM.

### 1. Server (API)

```bash
cd server
cp .env.example .env       # default settings for local development
npm install                # also generates the Prisma client into src/generated
npx prisma migrate deploy  # creates the SQLite database
npx prisma db seed         # adds the games
npm run dev                # http://localhost:3333
```

Settings in `server/.env`:

- `DATABASE_URL`: SQLite file, relative to the `server` folder.
- `PORT`: API port (default `3333`).
- `CORS_ORIGINS`: web origins allowed to call the API, comma-separated (default `http://localhost:5173`, `*` allows any origin). Set it to the deployed web URL in production.
- `TRUST_PROXY`: set it when the API runs behind a reverse proxy (for example `1` for one proxy hop), so the rate limits count each client separately.
- `PRISMA_LOG_QUERIES`: `true` logs every database query.

Each client can publish 10 ads per hour and look up 30 Discord handles per 15 minutes.

To browse the database: `npx prisma studio`.

### 2. Web

With the server running:

```bash
cd web
npm install
npm run dev  # http://localhost:5173
```

### 3. Mobile

With the server running:

```bash
cd mobile
npm install
npm start
```

Scan the QR code with [Expo Go](https://expo.dev/go) (Android) or the Camera app (iOS). The phone must be on the same Wi-Fi as the computer, and if you are signed in to Expo on the computer (`npx expo login`), Expo Go must be signed in to the same account. The app calls the API on port 3333 of the machine running Expo; to use another address, set `API_URL` before starting (for example `API_URL=http://192.168.0.10:3333 npm start`).

## ✅ Quality checks

Lint and format check, from the repository root (after `npm install` there):

```bash
npm run lint
npm run format:check
```

Tests, from the repository root:

```bash
(cd server && npm test)  # API routes against a temporary SQLite database, created and removed automatically
(cd web && npm test)     # components with Testing Library
(cd mobile && npm test)  # screens with React Native Testing Library
```

The same checks, plus type checks and builds, run on GitHub Actions for every push to `main` and every pull request.

<h5 align="center">
  &copy;2023 - <a href="https://github.com/devssaurinho/">Pan</a>
</h5>
