# monitarr

An extremely simple download monitoring tool for Sonarr and Radarr.

I wanted a simple way for other users who made requests using Overseerr/Jellyseerr to see the download progress of their requests without giving them access to the Sonarr/Radarr web interface, or asking me for updates. This tool does not have any authentication (!) so make sure you run it in a secure environment.

It uses the Sonarr/Radarr APIs to get a summary of the download queue and then serves a simple webpage using Next. There is a refresh button on the page which triggers a refresh job in Sonarr/Radarr and then fetches the latest data again.

I'm not sure what else to say. It's a simple tool. It's not pretty. It's not secure. It's not feature-rich. It's not well-tested. It's not well-anything. It's just a thing that I made for myself and decided to share in case someone else finds it useful.

## Issues

The logic for the download speed is extremely inaccurate.

## Installation

1. Clone the repository
2. Run `yarn install`
3. Copy `.env.example` to `.env` and fill in the required values:

    ```text
    SONARR_URL=http://localhost:8989
    SONARR_API_KEY=your-sonarr-api-key
    RADARR_URL=http://localhost:7878
    RADARR_API_KEY=your-radarr-api-key
    ```

4. Run `yarn build`
5. Run `yarn start`
6. Visit `http://localhost:3000` in your browser

## Docker

I haven't created a Dockerfile yet but it is on the list.

## Contributing

I'm not sure why you would want to contribute to this project but if you do, feel free to open a PR. Install the project as per the instructions above and run `yarn dev` to start the development server.
