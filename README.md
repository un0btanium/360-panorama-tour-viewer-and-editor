# 360° Panorama Tour Viewer & Editor

This project allows you to create and deploy a panorama tour viewer & editor website, making use of the Marzipano library and a nodejs + express + nedb backend.

The application allows you to upload sphere image in cubemap and equirectangular format. The backend will automatically turn the images into scalable cubemap tiles so that even large images can be shown in a performant and bandwidth efficient way.

The website provides you an secure admin mode, where you are able to create, add and delete panoramas, as well as place info hotspots and portals immersively into the panorama image to allow the user to move between panoramas and gain additional information.


## Interact with the website

Use left mouse button to look around the panorama. You can hover over and click on info hotspots to show more information. You can click on a portal (arrows) to move to the next panorama.

There are also buttons that allows the user to switch into fullscreen mode as well as allow the camera to slowly rotate automatically. All panoramas can be accessed by a menu in the top left as well.

The editor is deactivated by default. You can enable editor mode by right clicking the menu bar at the top of the screen and logging in (User: admin, Password: admin, these values can be changed in the /backend/constants.js file). Once activated, you can access the editor functionality by rightclicking anywhere on the panorama as well as rightclicking on info hotspots and portals. You can also export the current database state into a data.json file and replace it with the file into the /backend folder. The application will use this file to initialize the database once if no entries exist in the database yet.



## Develop and Deploy

Install [NodeJS](https://nodejs.org/en/). Copy the repository with `git clone` and enter the new folder. Execute the follow command:

```
npm install
```

To start the website locally, execute:

```
npm start
```

Webpack in watch mode is started as well as an express service that serves the frontend and panorama data. You can access the website in your browser on [localhost:3000](http://localhost:3000/).

You can check out the panorama data via the follow API: [localhost:3000/api-docs/](http://localhost:3000/api-docs/)

You can create a production webpack bundle (minified and browser compatibility) by executing:

```
npm run-script webpack-build
```


You can build a docker container with the following command. Prior, you need to set a name in the package.json at line 12 and 13.

```
npm run-script docker-build
```

You can start the docker container with

```
npm run-script docker-run
```