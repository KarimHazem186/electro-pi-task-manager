# Contributing to Electro Pi Task Manager

Thank you for considering contributing to this project! 🎉

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6+ (local or Atlas)
- Git

### Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/electro-pi-task-manager.git
   cd electro-pi-task-manager
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your credentials
   npm run seed  # Load sample data
   npm run dev   # Start server on port 5000
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local
   npm run dev   # Start on port 3000
   ```

4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Making Changes

### Code Style

- **Backend:** Follow existing patterns (MVC architecture)
- **Frontend:** Use TypeScript with proper types
- **Formatting:** Run `npm run format` (Prettier)
- **Linting:** Run `npm run lint` (ESLint)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user profile picture upload
fix: resolve task filtering bug
docs: update API documentation
test: add tests for project creation
refactor: simplify authentication middleware
```

### Testing

**Before submitting:**

```bash
# Backend tests
cd backend
npm test

# All tests should pass ✅
```

Add tests for new features:
- Place in `backend/__tests__/`
- Use Jest + Supertest
- Test success and error cases

### API Changes

If you modify API endpoints:

1. Update Swagger comments in route files
2. Test with Postman/Thunder Client
3. Update `backend/README.md` if needed
4. Add examples in documentation

## Pull Request Process

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Go to GitHub and click "New Pull Request"
   - Describe your changes clearly
   - Reference any related issues: `Closes #123`
   - Add screenshots for UI changes

4. **PR Checklist**
   - [ ] Code follows project style
   - [ ] Tests added and passing
   - [ ] Documentation updated
   - [ ] No merge conflicts
   - [ ] Commits are clean and descriptive

## What to Contribute

### Good First Issues 🟢

- Fix typos in documentation
- Improve error messages
- Add input validation
- Write missing tests

### Feature Ideas 💡

- Email notifications
- Calendar view for tasks
- File attachments to tasks
- Task comments/activity feed
- Advanced search filters
- Export projects/tasks (CSV/PDF)

### Bug Reports 🐛

Found a bug? Please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if UI bug)
- Environment (OS, browser, Node version)

## Code Review

All submissions require review. We'll:
- Check code quality and style
- Verify tests pass
- Ensure documentation is updated
- Test functionality locally

## Questions?

- Open an issue for discussion
- Check existing issues first
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for making this project better! 🚀
