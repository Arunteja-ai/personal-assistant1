import fs from "fs";
import path from "path";

const root = process.cwd();
const deliverableRoot = path.join(root, "deliverables", "ErNO_Class");
const frontendTarget = path.join(deliverableRoot, "Source Code", "Frontend");
const backendTarget = path.join(deliverableRoot, "Source Code", "Backend");

const removeIfExists = (targetPath) => {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
};

const ensureDir = (targetPath) => {
  fs.mkdirSync(targetPath, { recursive: true });
};

const copyCodeFiles = (sourceDir, targetDir, extensions) => {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      ensureDir(targetPath);
      copyCodeFiles(sourcePath, targetPath, extensions);
      continue;
    }

    if (extensions.includes(path.extname(entry.name))) {
      ensureDir(path.dirname(targetPath));
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
};

removeIfExists(frontendTarget);
removeIfExists(backendTarget);
ensureDir(frontendTarget);
ensureDir(backendTarget);

copyCodeFiles(path.join(root, "frontend", "src"), frontendTarget, [".js", ".jsx", ".ts", ".tsx"]);
copyCodeFiles(path.join(root, "backend", "src"), backendTarget, [".js", ".ts"]);

console.log("Deliverable source-code folders refreshed.");
