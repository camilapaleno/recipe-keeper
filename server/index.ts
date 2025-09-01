import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Function to find an available port
  const findAvailablePort = (startPort: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      const testServer = createServer();
      testServer.listen(startPort, '0.0.0.0', () => {
        const actualPort = (testServer.address() as any)?.port;
        testServer.close(() => resolve(actualPort));
      });
      testServer.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          findAvailablePort(startPort + 1).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
    });
  };

  // Start with the preferred port from environment variable or default to 5000
  const preferredPort = parseInt(process.env.PORT || '5000', 10);
  
  try {
    const availablePort = await findAvailablePort(preferredPort);
    server.listen({
      port: availablePort,
      host: "0.0.0.0",
    }, () => {
      if (availablePort !== preferredPort) {
        log(`Port ${preferredPort} was in use, serving on port ${availablePort} instead`);
      } else {
        log(`serving on port ${availablePort}`);
      }
    });
  } catch (error) {
    log(`Failed to find an available port: ${error}`);
    process.exit(1);
  }
})();
