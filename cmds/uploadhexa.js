const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

const octokit = new Octokit({
  auth: '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', 
});

const excludedFilesAndDirs = [
  '.config',
  '.upm',
  'node_modules',
  'package-lock.json',
  '.replit',
  'replit.nix',
  '.cache',
];

async function uploadToGitHub(event, api) {
  const filePath = path.join(__dirname, '..', 'json', 'userpanel.json');
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const vips = items.userpanel.VIPS;
  const senderID = event.senderID;

  if (!vips.includes(senderID)) {
    api.sendMessage('🚫 Access Denied. You lack the necessary permissions to utilize this command.', event.threadID);
    return;
  }

  api.sendMessage('🚀 Uploading Hexabot Sauce code to GitHub... Please wait.', event.threadID);

  const repoOwner = '0x3ef8'; 
  const repoName = 'Hexabot'; 
  const targetPath = path.join(__dirname, '..'); 
  try {
    await uploadDirectory(targetPath, '', repoOwner, repoName);

    api.sendMessage('✅ Hexabot Sauce code uploaded to GitHub successfully!', event.threadID);
  } catch (error) {
    console.error('Error:', error);
    api.sendMessage('❌ An error occurred while uploading the Hexa Sauce code to GitHub.', event.threadID);
  }
}

async function uploadDirectory(directoryPath, relativePath, owner, repo) {
  const files = await fs.promises.readdir(directoryPath);

  for (const file of files) {
    if (excludedFilesAndDirs.includes(file)) {
      continue;
    }

    const filePath = path.join(directoryPath, file);
    const relativeFilePath = path.join(relativePath, file);
    const fileStats = await fs.promises.stat(filePath);

    if (fileStats.isDirectory()) {
      await uploadDirectory(filePath, relativeFilePath, owner, repo);
    } else if (fileStats.isFile()) {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');

      const existingFile = await getFileContents(owner, repo, relativeFilePath);
      const sha = existingFile ? existingFile.sha : null;

      await octokit.repos.createOrUpdateFileContents({
        owner: owner,
        repo: repo,
        path: relativeFilePath,
        message: `Update ${relativeFilePath}`,
        content: Buffer.from(fileContent).toString('base64'),
        sha: sha,
      });
    }
  }
}

async function getFileContents(owner, repo, path) {
  try {
    const response = await octokit.repos.getContent({
      owner: owner,
      repo: repo,
      path: path,
    });

    return response.data;
  } catch (error) {
    if (error.status === 404) {
      return null; 
    }
    throw error;
  }
}

module.exports = uploadToGitHub;
