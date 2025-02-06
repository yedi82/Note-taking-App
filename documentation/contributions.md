## Daniel

I was working mostly on backend/frontend integration. Particularly setting up CRUD operations for folders, notes and users in the controllers, creating their routes and setting up calls to routes in frontend. I also set up the reset password by email link use nodemailer. I set up avatar upload and storage with disk using multer. I created the FolderCollaborators and NoteCollaborators models in order to set up sharing of notes and folders with the AddContributer component. I worked on delete profile (and deleting associated notes and folders). I also set up the Templates as an additional feature. I also researched into patching deprecated issue with the webpackDevServer.config.js in the react-scripts node module and found a solution on github. I helped set up ngrok such as adding header  'ngrok-skip-browser-warning': 'true'  to endpoint calls. Used madge <https://www.npmjs.com/package/madge> to help resolve circular dependencies.

#### Resources

<https://expressjs.com/en/guide/error-handling.html> - error handling for routes
<https://expressjs.com/en/guide/writing-middleware.html> - middleware functions
<https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/#error-handling> - constraints for sequelize (models)
<https://react.dev/learn/conditional-rendering> -Conditional rendering for UI
<https://nairihar.medium.com/graceful-shutdown-in-nodejs-2f8f59d1c357> - Helped with graceful shutdown
<https://www.dhiwise.com/post/how-to-manage-user-alerts-with-react-notification-component> -Helped with notification for delete user
<https://github.com/facebook/create-react-app/issues/12035?> We had the same dependency deprecation warning as others in this thread, webpackDevServer.config.js was deprecated in react-scripts node module. Was able to patch it by using recommendation from <https://github.com/facebook/create-react-app/issues/12035#issuecomment-2169043485>
<https://dev.to/nsantos16/why-is-ngrok-returning-html-3jn3> This helped sort out ngrok tunnel

## Anna

#### Resources

<https://logo.com/> - to generate the logo
<https://www.w3schools.com/react/react_memo.asp> - used to skip rendering if a component has not been changed
<https://marked.js.org/> - for marked rendering

## Yedidia

I focused on frontend development, using modern web tools to build a user-friendly and responsive interface.
React's core concepts, including hooks like useState and useEffect, managed state across components,
while Tailwind CSS ensured a clean, responsive design. I added animations with Framer Motion for
smooth transitions and used the Intersection Observer API to optimize performance with lazy loading. Additionally,
I managed dark/light mode preferences through React Context API and settings with localStorage,creating
a polished and efficient user experience with the help of v0 dev.

Most of the frontend was made making use of the following resources:

#### Resources

<https://reactjs.org/docs/getting-started.html> - Getting the general React concepts, hooks, and component structure, it was used in a lot of cases
to implement the state management in most pages|components in our project, we made use of the 'useState' and the 'useEffect' hooks.

<https://nextjs.org/docs> - making use of the App Router, server-side rendering and most of the API routing, this would be relevant if we were to implement server-side rendering for the notes list in the Dashboard component.

<https://tailwindcss.com/docs> - making use of the Tailwind CSS framework for styling components and
responsiveness, we used it for instance for styling the buttons in the Note page, such as the "Edit",
"Preview", and "Download" buttons.

<https://www.framer.com/motion> - making use of this for animations and transitions, Used for implementing
the animations in the Note page, such as the transition between edit and preview modes.

<https://lucide.dev/guide/packages/lucide-react> This assisted me alot with finding icons for the project,
Used for adding icons to the buttons in the Note page, such as the Download icon.

<https://reactrouter.com/en/main> - The React Router documentation assisted with setting up the routing for our project.
Used for setting up the routing in the application, particularly for navigating between the Dashboard and individual
sections you can see on the sidebar component.

<https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API> - The lazy loading and scrolling was made
making use of the Intersection Observer API. We made use of this implementing some of the lazy loading in the project.

<https://reactjs.org/docs/context.html> - Doing the theme management and switcher using the React Context API was helpful
for instance we made use of ThemeContext to make this possible for managing dark/light mode across the application.

<https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API> Given the theme management and switcher, we needed to
keep the theme consistent throughout so this article assisted us with ensuring that was possible, used for storing the
user's theme preference in localStorage so it persists across sessions.

<https://ui.shadcn.com/> This had a couple of pre-built componets we could utilise, which made things easier for us in
the implementaton process of the project. We made use of this in the header for instance the drop down menu when we click
on the user's profile avatar.

<https://v0.dev> made use of this AI tool to furhter enhance the UI/UX.

## Sinconor
I was working mostly with the backend/frontend integration as well with Daniel. Particularly for the authentication, so the Login and Sign up page. I worked on the Passkey extra feature in addition to normal login and sign up. This meant having to set up endpoints for these features to add the user information to the database etc so that the frontend and backend communicate properly. I also was responsible for ensuring the database tables are in BCNF, which I did by investigating the functional dependencies. Then I also ensured that the user passwords are hashed, using Bcrypt library which salts the password when making the hash for it. Furthermore I worked on the view recently used notes/folders page (set up both frontend and backend for it) and the feature of adding categories and filtering the search using the categories (both frontend and backend). I was also responsible for moving code form the dev branch to main branch on our gitLab repo.

#### Resources

<https://web.dev/articles/passkey-registration> - I used this to set up challenge generation and getting credentials.

<https://medium.com/free-code-camp/create-a-react-frontend-a-node-express-backend-and-connect-them-together-c5798926047c> - I used this resource to understand how to go about backend/frontend integration.

<https://www.geeksforgeeks.org/blowfish-algorithm-with-examples/> - I read this article to understand the blowfish algorithm.

<https://en.wikipedia.org/wiki/Bcrypt> - Then I found out about Bcrypt through this article which explains what it is and how it is based on the blowfish cipher as well as its ability to create a salt for the password.

<https://auth0.com/blog/hashing-in-action-understanding-bcrypt/> - this article showed examples of how to generate a hash using Bcrypt that can be used for password.

<https://www.lucidchart.com/pages/> - used this webiste to draw the ER diagram for the database.

## Pontsho

My contributions covered both UI features and API integration, with a focus on enhancing functionality and ensuring secure user interactions.
1. Frontend/UI Contributions

    Display List of Contributors: Developed the feature to display who is currently editing or viewing a note, improving real-time collaboration visibility.
    Markdown Functionality: Added Markdown support, enabling users to format notes with live preview functionality.

2. API/Frontend Integration

    User CRUD Operations: Worked with Daniel, who handled the core CRUD operations. My role was to implement authentication and authorization using JWT, ensuring that only authenticated users could access and manage their accounts.
    Categories Authentication/Authorization: Set up authentication and authorization for categories, securing the creation, update, and deletion of categories for authorized users only.

3. Database Security

    Sanitizing Database Queries: Secured the API by sanitizing database inputs to prevent SQL injection attacks, using tools like express-validator.

4. Real-Time Collaboration with WebSockets

    I set up the foundation for real-time collaboration using WebSockets, allowing multiple users to edit notes simultaneously. However, achieving live updates without requiring page reloads has been challenging, and this feature is still being refined to work seamlessly with real-time note updates and conflict resolution.
5. Conclusion

    My contributions included implementing secure authentication, Markdown functionality, and initial real-time collaboration features. Despite challenges with live updates via WebSockets, significant progress was made in delivering a collaborative platform with a focus on security and user experience, alongside working with Daniel on CRUD operations.

#### Resources

<https://socket.io/how-to/use-with-react> - Learn a practice example on how to use sockets in react web app and studied a basic implementation
<https://socket.io/get-started/chat> -Why use sockets and How to use sockets to listen in the server.

<https://medium.com/@novaliastevany7/sequelize-model-for-user-authentication-in-node-js-605355aee491> - Article  onSequelize model forUser Authentication Node.js

<https://stackoverflow.com/questions/6711313/database-storing-multiple-types-of-data-but-need-unique-ids-globally> - Database storing and multiple types of data

<https://stackoverflow.com/questions/21694933/how-can-i-get-a-specific-data-using-sql-select-query> Got Guidelines on "How can I get a specific data using SQL select query"

<https://www.imperva.com/learn/data-security/data-sanitization/> Article on What Data sanitization is/

<https://security.stackexchange.com/questions/172297/sanitizing-input-for-parameterized-queries> Sanitizing input for parameterized queries
