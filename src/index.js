import {resolve, dirname} from 'path';
import {sync as resolveNodeModule} from 'resolve';

export default function ({types: t}) {
  function isRequireCall(node, state, filesMap) {
    return (
      t.isCallExpression(node) &&
      t.isIdentifier(node.callee, {name: 'require'}) &&
      node.arguments.length === 1 &&
      t.isStringLiteral(node.arguments[0])
    );
  }

  function getDevPath(file, productionPath) {
    if (productionPath[0] === '.') return null;
    let pkg = null;
    const name = productionPath.split('/')[0];
    try {
      pkg = require(resolveNodeModule(name + '/package.json', {basedir: dirname(file)}));
    } catch (ex) {
      return null;
    }
    if (!pkg.developmentVersions) return null;
    const prodNames = Object.keys(pkg.developmentVersions);
    for (const name of prodNames) {
      if (productionPath.indexOf(name) === 0) {
        return pkg.developmentVersions[name] + productionPath.substr(name.length);
      }
    }
    return null;
  }

  return {
    visitor: {
      CallExpression(path) {
        if (isRequireCall(path.node)) {
          const devPath = getDevPath(resolve(this.file.opts.filename), path.node.arguments[0].value);
          if (devPath && devPath !== path.node.arguments[0].value) {
            path.replaceWith(t.callExpression(
              path.node.callee,
              [t.stringLiteral(devPath)],
            ));
          }
        }
      },
      ImportDeclaration(path) {
        if (t.isStringLiteral(path.node.source)) {
          const devPath = getDevPath(resolve(this.file.opts.filename), path.node.source.value);
          if (devPath && devPath !== path.node.source.value) {
            path.replaceWith(t.importDeclaration(
              path.node.specifiers,
              t.stringLiteral(devPath),
            ));
          }
        }
      },
    },
  };
}
