# PreDel Blogging Platform Client

## Overview

Personal project (Jun 2024 - Sep 2024) consisting of a frontend application for a blogging platform.
Built with Angular, the client consumes a REST API to provide user authentication, content creation, and blog post visualization through a responsive interface.

This application is part of a distributed setup and is not intended to be executed independently.

For full application execution (API + client + database), refer to the Docker Compose project:
[PreDel Blogging Platform](https://github.com/danielpredel/predel-blog.git)

## Features

* User authentication (login and registration)
* Blog post creation and editing
* WYSIWYG editor for content writing
* Post listing and detailed view
* Responsive UI design using UIkit
* Component-based architecture with reusable UI elements
* API-driven state management via Angular services

## Project Structure

```
src/
├── app/
│   ├── content-editor/            # Module for post creation/editing
│   │   ├── code-snippet/
│   │   ├── editor/                # Main editor page
│   │   ├── image/
│   │   ├── list/
│   │   ├── list-item/
│   │   ├── meta/
│   │   ├── speed-dial/
│   │   ├── text/
│   │   ├── tooltip/
│   │   ├── content-editor.module.ts
│   │   ├── node-maker.service.ts
│   │   └── static-id.service.ts
│   │
│   ├── home/                      # Public content rendering
│   │   ├── blog-entry/            # Post detail view
│   │   ├── code-snippet/
│   │   ├── homepage/              # Landing page
│   │   ├── image/
│   │   ├── list/
│   │   ├── list-item/
│   │   ├── text/
│   │   └── home.module.ts
│   │
│   ├── shared/                    # Shared logic
│   │   ├── services/              # API communication
│   │   └── shared.module.ts
│   │
│   ├── user/                      # Authentication module
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── match.password.validator.ts
│   │   └── user.module.ts
│
├── assets/
└── environments/
```

## Application Overview

### Authentication

* Login view connected to `/auth/login`
* Registration flow integrated with user creation and email validation

### Posts

* Post listing page consuming `/posts`
* Post detail view consuming `/posts/:id`

### User Content

* Post creation via `/users/posts`
* Post editing via `/users/posts/:id`

## Notes

* Follows a component-based architecture with separation of concerns
* Uses Angular services as an abstraction layer over HTTP communication
* Reactive programming patterns implemented with RxJS
* UI designed with responsiveness and component reuse in mind
* Tight coupling with backend API structure (user-scoped post endpoints)
* Partial implementation: some UI flows and edge cases were not fully completed
* Error handling and state management are basic and not centralized

## Project Status

Archived – no active development.
Maintained as a portfolio project.
