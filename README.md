# ⚡ Graph_Visual_Component (PCF for PowerApps)

A **PowerApps Component Framework (PCF)** control designed to render **interactive graph visualizations** within Canvas and Model-driven PowerApps. This component enables seamless exploration of **nodes, relationships, workflows, and hierarchies** directly in your PowerApps environment.

---

## ✨ Features

- 📊 **Interactive Graph Rendering**: Dynamically visualize nodes and edges with smooth interactions.
- 🖌 **Customizable Styles**: Easily adjust colors, sizes, labels, and other visual properties.
- 🔍 **Zoom & Pan Support**: Navigate complex graphs effortlessly with zoom and pan functionality.
- 🔗 **Relational Data Integration**: Connects seamlessly with CDS/Dataverse/Dynamics 365 data sources.
- ⚙️ **Versatile Use Cases**: Supports workflows, organizational charts, dependency mapping, and more.

---

## 🛠 Getting Started

Follow these steps to set up and use the **Graph_Visual_Component** in your PowerApps environment:

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [PowerApps CLI](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/get-powerapps-cli)
- A PowerApps environment with access to CDS/Dataverse or Dynamics 365

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Muzain187/Graph_Visual_Component.git
cd Graph_Visual_Component
```

### 2️⃣ Install Dependencies

Install the required Node.js packages:

```bash
npm install
```

### 3️⃣ Build the Component

Compile the PCF control:

```bash
npm run build
```

### 4️⃣ Test Locally

Run the component in the PCF test harness with watch mode for real-time updates:

```bash
npm start watch
```

### 5️⃣ Deploy to PowerApps

1. Package the solution:
   ```bash
   pac solution init --publisher-name <your-publisher> --publisher-prefix <your-prefix>
   pac solution add-reference --path .
   msbuild /t:build /restore
   ```
2. Import the generated solution into your PowerApps environment.
3. Add the component to your Canvas or Model-driven app.

---

## 📂 Repository Structure

```
📦 Graph_Visual_Component
 ┣ 📂 src
 ┃ ┣ 📜 GraphComponent.tsx   # Main React component for graph rendering
 ┃ ┣ 📜 index.ts            # Entry point for the PCF control
 ┣ 📜 ControlManifest.Input.xml  # PCF manifest file
 ┣ 📜 package.json           # Node.js dependencies and scripts
 ┣ 📜 README.md              # This file
 ┣ 📜 LICENSE                # MIT License file
```

---

## 💡 Use Cases

- **Workflow Visualization**: Display process flows and task dependencies.
- **Organizational Charts**: Create interactive hierarchies for teams or departments.
- **Relationship Exploration**: Map and explore connections in relational data.
- **Dependency Mapping**: Visualize dependencies in projects or systems.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE). See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

For major changes, please open an issue first to discuss your ideas.

---

## 🌟 Support

If you find this project helpful, please ⭐ the repository and share it with the PowerApps community!

---

## 📬 Contact

For questions or support, open an issue on the [GitHub repository](https://github.com/Muzain187/Graph_Visual_Component) or contact the maintainer at [your-contact-info].