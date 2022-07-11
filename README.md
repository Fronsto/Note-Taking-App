<div align="center" >

<img width="627" alt="banner" src="https://user-images.githubusercontent.com/95305611/176699894-1f679c22-510b-41e6-bc09-ba5509bba627.png">

![image](https://user-images.githubusercontent.com/95305611/177327183-330d7552-478f-4dee-9985-1af809bc37eb.png)

### A minimalistic webapp designed for fast collaborative note taking, created with Javascript/Typescript, Reactjs, Nodejs, Socket.io and runs on a GraphQL Server.
</div>




# Demo

You can find a working demo [here](https://awesome-note-app.netlify.app/).

# Table of contents

-   [Introduction](#introduction)
-   [Technologies](#technologies)
-   [Features](#features)
-   [How it works](#how-it-works)
-   [Launch](#launch)
-   [Sources and Inspirations](#sources-and-inspirations)
-   [License](#license)

# Introduction

This is a learning project. I wanted to learn web development and so decided to build a note-taking webapp having a [WYSIWYG editor](https://en.wikipedia.org/wiki/WYSIWYG) and supports markdown shortcuts and collaborative features. My initial plan involved implementing a lot of features but to finish the project in a reasonable period of time, I focused on implementing only the core features. What I ended up with is a minimalistic app with a slick UI.

# Technologies

-   Javascript/Typescript
-   [React](https://reactjs.org/)
-   [Slate](https://github.com/ianstormtaylor/slate)
-   [TailwindCSS](https://tailwindcss.com/)
-   [Node.js](https://nodejs.org/en/about/)
-   [Express.js](https://expressjs.com/)
-   [Socket.io](https://socket.io/)
-   [GraphQL](https://graphql.org/learn/) ( [Apollo](https://www.apollographql.com/docs/) and [Type-Graphql](https://typegraphql.com/docs/introduction.html))
-   [TypeORM](https://typeorm.io/) and PostgreSQL
-   [Mongoose](https://mongoosejs.com/docs/index.html) and MongoDB

# Features

    
-   Share with others by adding their email, manage permissions easily and collaborate with changes synced real-time.
    
    ![grps](https://user-images.githubusercontent.com/95305611/177324674-d47364da-5118-4c14-8df1-1eabf5d7a232.gif)

    -   Added members are added as "collaboraters", meaning they would have access to edit the page but not change the title or delete it or invite other members.
    -   A Team menu will appear when you add users to a page, and from there you can make them admins who will have access to invite other users to the page and make them admins.
    -   Only the owner (the person who created the page) can change title or delete the page.
    
    ![grpm](https://user-images.githubusercontent.com/95305611/177324713-4f8d4204-a424-46a8-b169-2a312d20d24f.gif)

    ---
    
-   Markdown shortcuts :
    -   `# ` , `##` , ` ###` => headings
    -   ` ``` ` => codeblock
    -   `>` => blockquote
    -   `* ` , `-` or `+` => lists
    -   `[]` => checklists
    -   `--- `or` ***` => hr
      
    ![mdsh](https://user-images.githubusercontent.com/95305611/177314298-234c2d5d-2a48-465c-9851-eeacab191574.gif)

    ---


-   Toolbar, with options to convert selected text to any other block type, or make it bold,italic,underlined,strikethrough, hightlighted or code.
    
    ![tlbr](https://user-images.githubusercontent.com/95305611/177318201-2b113dc4-6412-4464-8926-48559468facc.gif)
    
    ---

-   Change heading directly by editting it, the request to backend will be fired after 1 second when user stops

    ![Animation](https://user-images.githubusercontent.com/95305611/177313077-b32a9bbe-0330-4101-831e-a1cfef8df931.gif)

    ---

-   Mark pages favourite, access them easily from sidebar

    ![favsec](https://user-images.githubusercontent.com/95305611/177320633-06761970-3902-4b2d-980e-3c9da89182a5.gif)

    ---

-   Paste image url to insert images
    
    ![imga](https://user-images.githubusercontent.com/95305611/177322510-d97437a3-c662-455d-b8c3-4bb120d4f6a0.gif)


# How it works

<img width="771" alt="workflow of the app" src="https://user-images.githubusercontent.com/95305611/178270811-cc0119cc-0de0-41ba-8e69-a36ab1bdae3c.png">


### The WYSIWYG editor

The editor is built with [Slate](https://github.com/ianstormtaylor/slate). Slate stores the entire document as a JSON object and provides easy to use methods to modify the contents.

### Collaboration

In slate, every change in content is treated as an "operation" applied to the editor. Operation such as "add letter 'a' at offset 13 on 5th paragraph". Each operation is sent to the server using socket.io, and there it gets broadcasted to all other connected clients. When a client recieves certain operations, it applies them on the slate edtior.

### API

The project uses a GraphQL server attached with an Express Server to handle fetching data (getting pages of a user or users of a page), creating/deleting pages, checking for permissions, sharing a page with other users and then changing their access to it, etc.

### Database

The data of users and their associated pages is stored in a PostgreSQL database, since it can be modelled as a simple many-to-many relationship (each user has many pages and each page has many users) and thus would be stored efficiently in a RDBMS. The page contents are stored in MongoDB, since that data would be huge.

### User Authentication

This project uses JWT for authenticaiton/authorization. This is the authentication strategy used :

-   When someone logs in, they recieve 2 tokens, one access token, other refresh token.
-   Access token is stored in memory (like a simple javascript variable), thus preventing XSS and CSRF attacks, and to deal with it being volatile whenever the page reloads, frontend first calls the `/refresh_token` route to get an access token. It also does so whenever before a request it finds the access token to be expired, thus auto-renewing it.
-   Now the refresh token by itself does nothing, so it is safely stored in a cookie with httpOnly enabled.

-   The `/refresh_token` route also renews refresh token, thus a user can stay logged in for an indefinite period of time.

# Launch

The project is completely separated into frontend 'client' and backend 'server'.

-   First configure the environment variables, create an `.env` file in both server and client and set the frontend-backend urls and database uris (check out `.env.example` file).

-   Then install dependencies then start the server and the client.

    ```
    // Server, run these inside /server folder
    yarn install
    yarn start
    ```

    ```
    // Client, run these inside /client folder
    npm install
    npm start
    ```

# Project Status

I had a fun time working on this project, right now its on hold but I will probably come back later to expand it further.

# Sources and Inspirations

Here is a list of some sources that helped me in building this project:

-   Fireship's [TailwindCSS tutorial](https://youtu.be/pfaSUYaSgRo)
-   Ben Awad's [Google Docs Clone playlist](https://youtube.com/playlist?list=PLN3n1USn4xllb05dQVmRbVtGP2aM4seVq)
-   Tech Dummies' [Google Docs System Design](https://youtu.be/U2lVmSlDJhg)
-   Ben Awad's [JWT authentication Node.js tutorial](https://youtu.be/25GS0MLT8JU)

# License

MIT License
