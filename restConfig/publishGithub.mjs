

import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const log = (...args) => console.log("[publishGithub]", ...args);
const errorLog = (...args) => console.error("[publishGithub]", ...args);

const readJson = async (urlLike) => JSON.parse(await readFile(urlLike, "utf8"));

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const runCommand = (command, args, options = {}) => new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: true, ...options });
    child.on("error", reject);
    child.on("close", (code) => {
        if (code === 0) return resolve();
        reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
});

const getOwnerRepoFromPackage = (pkg) => {
    try {
        const url = (pkg?.repository && (pkg.repository.url || pkg.repository)) || "";
        const match = url.match(/github\.com[:/](?<owner>[^/]+)\/(?<repo>[^/.]+)(?:\.git)?$/i);
        if (match && match.groups) {
            return { owner: match.groups.owner, repo: match.groups.repo };
        }
    } catch (_) {}
    // Fallback to known defaults
    return { owner: "Avri-Here", repo: "awsAppManager" };
};

const githubRequest = async (token, method, path, body) => {
    const res = await fetch(`https://api.github.com${path}`, {
        method,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "User-Agent": "awsAppManager-publish-script"
        },
        body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 204) return { ok: true, status: 204 };
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message = data?.message || `HTTP ${res.status}`;
        const err = new Error(message);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
};

const ensureCleanRelease = async ({ token, owner, repo, tag }) => {
    // Try find existing release by tag
    try {
        const existing = await githubRequest(token, "GET", `/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`);
        if (existing?.id) {
            log(`Deleting existing release id=${existing.id} for tag ${tag}`);
            await githubRequest(token, "DELETE", `/repos/${owner}/${repo}/releases/${existing.id}`);
            // Small delay to allow backend to settle
            await delay(500);
        }
    } catch (e) {
        if (e?.status !== 404) {
            throw e;
        }
    }

    // Try delete tag ref
    try {
        await githubRequest(token, "DELETE", `/repos/${owner}/${repo}/git/refs/tags/${encodeURIComponent(tag)}`);
        await delay(300);
        log(`Deleted tag ref ${tag}`);
    } catch (e) {
        if (e?.status !== 422 && e?.status !== 404) {
            // 422: reference does not exist
            throw e;
        }
    }
};

const publishDraftRelease = async ({ token, owner, repo, tag, version }) => {
    try {
        log(`Looking for draft releases...`);
        const releases = await githubRequest(token, "GET", `/repos/${owner}/${repo}/releases`);
        
        // Find draft release that matches our version
        const draftRelease = releases.find(r => r.draft && (
            r.name === version || 
            r.name === tag ||
            r.tag_name === tag
        ));
        
        if (draftRelease) {
            log(`Found draft release: id=${draftRelease.id}, name="${draftRelease.name}", tag="${draftRelease.tag_name}"`);
            
            // Update the release to have the correct tag and publish it
            await githubRequest(token, "PATCH", `/repos/${owner}/${repo}/releases/${draftRelease.id}`, {
                tag_name: tag,
                name: tag,
                draft: false
            });
            log(`✅ Successfully published draft release ${tag} to public!`);
        } else {
            log(`No draft release found matching version ${version}`);
        }
    } catch (e) {
        log(`Warning: Could not publish draft release: ${e.message}`);
    }
};

const main = async () => {
    const pkg = await readJson(new URL("../package.json", import.meta.url));
    const version = pkg?.version?.trim();
    if (!version) throw new Error("Could not read version from package.json");

    const { owner, repo } = getOwnerRepoFromPackage(pkg);
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("Missing GH_TOKEN (or GITHUB_TOKEN) environment variable with 'repo' scope");
    }

    const tag = `v${version}`;
    log(`Preparing publish for ${owner}/${repo} version ${version} (tag ${tag})`);

    await ensureCleanRelease({ token, owner, repo, tag });

    // Ensure builder uses the exact version from package.json
    process.env.VITE_APP_VERSION = version;

    log("Building renderer (vite build)...");
    await runCommand("npm", ["run", "build"], { env: process.env });

    log("Publishing artifacts via electron-builder --publish always ...");
    await runCommand("npx", ["electron-builder", "--config", "restConfig/electronBuilder.config.js", "--publish", "always"], { env: process.env });

    // Auto-publish the draft release that electron-builder created
    log("Converting draft release to published...");
    await publishDraftRelease({ token, owner, repo, tag, version });

    log("Publish completed successfully.");
};

main().catch((e) => {
    errorLog("Failed:", e?.stack || e?.message || String(e));
    process.exit(1);
});


