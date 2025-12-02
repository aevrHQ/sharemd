# Markdown Viewer

A modern, feature-rich application for sharing and viewing Markdown files. Upload your markdown files or paste content directly to generate shareable links instantly.


## Features

- **Easy Upload**: Drag and drop `.md` files or paste markdown text directly.
- **Instant Sharing**: Generate unique, shareable links for your markdown content.
- **Beautiful Viewer**: Render markdown with syntax highlighting and a clean, readable typography.
- **Local Storage**: Automatically save your generated links to "My Links" for easy access later.
- **Export Options**: Download your markdown content as a file.
- **Dark Mode**: Fully supports dark mode for comfortable reading.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: Custom components with [Radix UI](https://www.radix-ui.com/) primitives.
- **Icons**: [Iconsax React](https://github.com/lusaxweb/iconsax-react)

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas cluster)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/md-viewer.git
    cd md-viewer
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

3.  **Environment Setup**

    Create a `.env.local` file in the root directory and add your MongoDB connection string:

    ```env
    MONGODB_URI=mongodb://localhost:27017/md-viewer
    ```

    If you don't provide this, it will default to the local connection string above.

4.  **Run the development server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1.  **Create a Link**:
    - On the home page, drag and drop a markdown file into the upload area.
    - Alternatively, paste your markdown text into the text area and click "Generate Link".
2.  **View & Share**:
    - You will be redirected to a view page with your rendered markdown.
    - Use the toolbar to **Share** (copy link), **Download**, or **Bookmark** the page.
3.  **Manage Links**:
    - Click "My Links" in the header to see a history of your created and saved markdowns.
    - Links are stored locally in your browser.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
