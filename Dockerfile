# Use nginx alpine image for lightweight static file serving
FROM nginx:alpine

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY main.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY img/ /usr/share/nginx/html/img/

# Copy custom nginx configuration if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
