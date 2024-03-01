# Everything Flow Monorepo
<img src="https://github.com/Everything-Design/everythingflow/assets/154067265/1c29e213-d355-46d0-a9a3-deb8732cabf7" width="200" alt="Everything Flow Monorepo">

Welcome to the Everything Flow monorepo! This repository is your one-stop solution for integrating Everything Flow projects with Webflow. Follow the instructions below to use the projects in your Webflow site.

## Getting Started

### 1. Clone the Monorepo Locally

First, clone this repository to your local machine to get started with the projects.

```bash
git clone https://github.com/Everything-Design/everythingflow.git
```

### 2. Project Structure and Guidelines

When contributing to the repository or using its contents, please adhere to the following structure and guidelines:

- **Project Folders:** Each project should have its own separate folder within the repository.
- **Scripts:** If your project includes JavaScript, place the scripts inside the project's folder with relevant file names.
- **Naming Schemes:** Ensure you are using the correct naming schemes for folders and files. This helps in maintaining consistency and organization across the repository.

### 3. Creating a CDN Link

To use the script files in your Webflow projects, you'll need to serve them via a CDN. jsDelivr allows you to directly link to files hosted on GitHub.

1. Navigate to [jsDelivr GitHub](https://www.jsdelivr.com/github).
2. Enter the GitHub repository URL: `https://github.com/Everything-Design/everythingflow`.
3. Copy the CDN Link Provided by jsDelivr: jsDelivr gives you a direct link to the script file. To always use the latest version of the file, modify the URL by replacing the branch name `main` with `latest`. This ensures your project automatically updates to use the newest version of the script without needing manual updates.

**Example Conversion:**

- Original URL: `https://cdn.jsdelivr.net/gh/Everything-Design/everythingflow@main/project-name/script.js`
- Modified URL for Latest Version: `https://cdn.jsdelivr.net/gh/Everything-Design/everythingflow@latest/project-name/script.js`

### 4. Using the CDN in Your Webflow Site

Once you have your CDN link, you can add it to your Webflow site as follows:

1. Go to your Webflow site's dashboard and navigate to the **Custom Code** section.
2. Paste the CDN link into the **Head Code** or **Footer Code** field, wrapped within a `<script>` tag.
   
   Example:
   ```html
   <script src="YOUR_CDN_LINK_HERE"></script>
   ```
3. Save your changes and publish your site.

##Update on Visual Studio
code:
1. git init
2. git add .
3. git commit -m "Initial commit"

