# Contributing to SnapDB

Thank you for your interest in contributing! Please follow these guidelines to help us maintain a high-quality project.

## How to Contribute

1. **Fork the repository** and create your branch from `main`.
2. **Describe your changes** in a clear commit message.
3. **Write tests** for new features or bug fixes.
4. **Run `npm run lint` and `npm run test`** to ensure code quality and passing tests.
5. **Open a Pull Request** with a clear description of your changes and why they are needed.

## Coding Standards
- Use TypeScript and follow the existing code style (see ESLint/Prettier configs).
- Write clear, concise comments explaining complex logic.
- Keep code modular and avoid monolithic changes.
- Prefer composition and plugin-based extensions.

## Plugin Contributions
- Place plugins in `src/` as separate files.
- Export a factory function and types for configuration.
- Add usage and configuration examples to the README if your plugin is general-purpose.

## Reporting Issues
- Please provide a minimal reproduction and clear description.

## License
By contributing, you agree that your contributions will be licensed under the MIT License. 