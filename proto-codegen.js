// const {CodegenHelper, SystemHelper} = require('fa-node');
const path = require('path');
const fs = require('fs');
const { WriteFileOptions } = require('fs');
const exec = require('util').promisify(require('child_process').exec);

function createDirectorySync(directory) {
  try {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  } catch (e) {
    console.error(e);
  }
}

function deleteDirectorySync(directory, onlyEmpty) {
  try {
    if (onlyEmpty) {
      fs.readdirSync(directory).forEach((file) => {
        const fullPath = path.join(directory, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
          deleteDirectorySync(fullPath, onlyEmpty);
        }
      });
      if (fs.readdirSync(directory).length === 0) {
        fs.rmdirSync(directory);
      }
    } else if (fs.statSync(directory).isDirectory()) {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  } catch (e) {
    console.error(e);
  }
}

function createFileSync(filePath, data, options) {
  try {
    createDirectorySync(path.dirname(filePath));
    fs.writeFileSync(filePath, data, options || { encoding: 'utf-8' });
  } catch (e) {
    console.error(e);
  }
}

function deleteFileSync(filePath) {
  try {
    if (fs.lstatSync(filePath).isFile()) {
      fs.rmSync(filePath, { force: true });
    }
  } catch (e) {
    console.error(e);
  }
}

function scanFilesSync(directory, filter) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  const result = [];
  const entries = fs.readdirSync(directory);
  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      result.push(...scanFilesSync(fullPath, filter));
    } else if (
      !filter ||
      filter?.some((item) => {
        return item.test(fullPath);
      })
    ) {
      result.push(fullPath);
    }
  }
  return result;
}

async function fetchJson(host, init) {
  try {
    const response = await fetch(host, init);
    if (!response.ok) {
      console.error('fetch', host, new Error(response.statusText));
      return null;
    }
    console.log('fetch', host);
    return await response.json();
  } catch (e) {
    console.error('fetch', host, e);
    return null;
  }
}

async function buildProto(source, destination, file) {
  try {
    fs.mkdirSync(destination, { recursive: true });
    const command = ['protoc', `--proto_path=${source}`, `--php_out=${destination}`, file];
    await exec(command.join(' '));
    console.log('build', path.basename(file));
  } catch (e) {
    console.error('build', path.basename(file), e);
  }
}

/**
 *
 */
void (async () => {
  const rootPath = __dirname;
  const protoPath = `${rootPath}/proto`;
  const protoExtensionList = [/.proto$/];
  const protoGeneratedExtensionList = [/_pb\.d\.ts$/, /_pb\.js$/];
  const protoServiceList = [
    {
      name: 'booking-service',
      host: 'http://localhost:3001/proto',
    },
    {
      name: 'tour-service',
      host: 'http://localhost:3002/proto',
    },
  ];
  /**
   * Foreign proto
   */
  for (const { name, host } of protoServiceList) {
    console.log('protobuf', `${protoPath}/${name}`.replace(rootPath, ''));
    const proto = await fetchJson(host, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (proto) {
      for (const { dirname, filename, content } of proto) {
        createFileSync(`${protoPath}/${name}/${dirname}/${filename}`, content);
      }
      scanFilesSync(`${protoPath}/${name}`, protoGeneratedExtensionList).forEach((file) => {
        deleteFileSync(file);
      });
      for (const file of scanFilesSync(`${protoPath}/${name}`, protoExtensionList)) {
        await buildProto(`${protoPath}/${name}`, `${protoPath}/${name}`, file);
      }
      scanFilesSync(`${protoPath}/${name}`, protoExtensionList).forEach((file) => {
        deleteFileSync(file);
      });
    }
    deleteDirectorySync(`${protoPath}/${name}`, true);
  }
})();
