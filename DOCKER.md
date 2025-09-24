# Docker & GitHub Container Registry Setup

## Overview
This project uses GitHub Actions to automatically build and push Docker images to GitHub Container Registry (ghcr.io).

## Workflow Triggers
The Docker build workflow runs automatically on:
- **Push to main/master branch** → Creates `latest` tag
- **New releases/tags** → Creates semantic version tags
- **Manual trigger** → Via GitHub Actions UI

## Image Tags
Images are tagged using the following strategy:

| Trigger | Tags Created | Example |
|---------|-------------|---------|
| Push to main | `latest`, `main`, `main-<sha>` | `latest`, `main`, `main-abc1234` |
| Release v1.2.3 | `1.2.3`, `1.2`, `1`, `latest` | `1.2.3`, `1.2`, `1` |
| Feature branch | `<branch>`, `<branch>-<sha>` | `feature-auth`, `feature-auth-def5678` |

## Repository Setup Required

### 1. Enable GitHub Container Registry
1. Go to your repository settings
2. Navigate to **Actions** → **General**
3. Under "Workflow permissions", select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests**

### 2. Package Visibility (Optional)
By default, packages are private. To make them public:
1. Go to your repository
2. Click **Packages** tab
3. Click on your package name
4. Go to **Package settings**
5. Change visibility to **Public**

## Using the Docker Image

### Pull and Run Latest
```bash
# Pull latest image
docker pull ghcr.io/jparkerweb/trim-style:latest

# Run on port 8080
docker run -p 8080:80 ghcr.io/jparkerweb/trim-style:latest
```

### Pull Specific Version
```bash
# Pull specific version
docker pull ghcr.io/jparkerweb/trim-style:1.0.0

# Run specific version
docker run -p 8080:80 ghcr.io/jparkerweb/trim-style:1.0.0
```

### Available Tags
View all available tags at: `https://github.com/jparkerweb/trim-style/pkgs/container/trim-style`

## Local Development

### Build Locally
```bash
# Build image
docker build -t trim-style .

# Run locally
docker run -p 8080:80 trim-style
```

### Test Before Push
```bash
# Build with same tags as CI
docker build -t ghcr.io/jparkerweb/trim-style:test .

# Test the image
docker run -p 8080:80 ghcr.io/jparkerweb/trim-style:test
```

## Workflow File Location
The GitHub Action workflow is located at:
```
.github/workflows/docker-publish.yml
```

## Troubleshooting

### Permission Denied
If you get permission errors:
1. Check repository **Actions** permissions
2. Ensure **Workflow permissions** are set to "Read and write"
3. Verify the `GITHUB_TOKEN` has package write access

### Image Not Found
If `docker pull` fails:
1. Check if the workflow completed successfully
2. Verify package visibility settings
3. Ensure you're using the correct image name format

### Build Failures
Common issues:
- **Dockerfile syntax errors**: Check your Dockerfile
- **Missing files**: Ensure all COPY paths exist
- **Large image size**: Review .dockerignore file

## Best Practices

### Dockerfile Optimization
- Use multi-stage builds for smaller images
- Leverage Docker layer caching
- Keep .dockerignore updated

### Security
- Never hardcode secrets in Dockerfile
- Use specific base image tags (not `latest`)
- Regularly update base images

### Tagging
- Use semantic versioning for releases
- Tag stable versions for production use
- Include commit SHA for debugging
