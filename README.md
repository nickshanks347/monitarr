# monitarr

![image](https://github.com/user-attachments/assets/a336edca-ab09-43f3-9ed2-d0f218881fd0)

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
    BASE_PATH=
    ```

    **Optional**: Set `BASE_PATH` to host monitarr on a subfolder (e.g., `BASE_PATH=/monitarr` to access at `http://localhost:3000/monitarr`). This is useful for reverse proxy setups where you want to host monitarr at `yourdomain.com/monitarr` instead of a subdomain.

4. Run `yarn build`
5. Run `yarn start`
6. Visit `http://localhost:3000` in your browser

## Docker

A Docker image is available at `ghcr.io/nickshanks347/monitarr:latest`. You can use Docker compose to run it:

```yaml
services:
  monitarr:
    container_name: monitarr
    image: ghcr.io/nickshanks347/monitarr:latest
    ports:
      - 3000:3000
    environment:
      - SONARR_URL=http://sonarr:8989
      - SONARR_API_KEY=YOUR_SONARR_API_KEY
      - RADARR_URL=http://radarr:7878
      - RADARR_API_KEY=YOUR_RADARR_API_KEY
      - BASE_PATH=/monitarr  # Optional: for subfolder hosting
    restart: unless-stopped
```

If you would like to build locally, feel free to use the Dockerfile or the `compose-build.yml` file located in the `.docker` directory.

## Contributing

I'm not sure why you would want to contribute to this project but if you do, feel free to open a PR. Install the project as per the instructions above and run `yarn dev` to start the development server.
