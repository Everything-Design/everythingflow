# Everything Flow Monorepo

![image](https://github.com/Everything-Design/everythingflow/assets/154067265/d5bf0b0c-4cd5-40f1-a359-3186ddf384d2)
![image](https://github.com/Everything-Design/everythingflow/assets/154067265/b4880a66-e760-4a6b-a510-2864f43d51bb)



Welcome to the Everything Flow monorepo! This repository is your one-stop solution for integrating Everything Flow projects with Webflow. Follow the instructions below to use the projects in your Webflow site.

## Getting Started

### 1. Clone the Monorepo Locally

First, clone this repository to your local machine to get started with the projects.

\```bash
git clone https://github.com/Everything-Design/everythingflow.git
\```

### 2. Project Structure and Guidelines

When contributing to the repository or using its contents, please adhere to the following structure and guidelines:

- **Project Folders:** Each project should have its own separate folder within the repository.
- **Script Tags:** If your project includes JavaScript, place the script tags inside the project's folder.
- **Naming Schemes:** Ensure you are using the correct naming schemes for folders and files. This helps in maintaining consistency and organization across the repository.

### 3. Creating a CDN Link

To use the script files in your Webflow projects, you'll need to serve them via a CDN. jsDelivr allows you to directly link to files hosted on GitHub.

1. Navigate to [jsDelivr GitHub](https://www.jsdelivr.com/github).
2. Enter the GitHub repository URL: `https://github.com/Everything-Design/everythingflow`.
3. Find the script file you wish to use and copy the CDN link provided by jsDelivr.

### 4. Using the CDN in Your Webflow Site

Once you have your CDN link, you can add it to your Webflow site as follows:

1. Go to your Webflow site's dashboard and navigate to the **Custom Code** section.
2. Paste the CDN link into the **Head Code** or **Footer Code** field, wrapped within a `<script>` tag.
   
   Example:
   \```html
   <script src="YOUR_CDN_LINK_HERE"></script>
   \```
3. Save your changes and publish your site.

