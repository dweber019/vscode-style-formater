import vscode = require("vscode");
let prettydiff = require("prettydiff");

export function format(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions) {

  if (range === null) {
    let start = new vscode.Position(0, 0);
    let end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
    range = new vscode.Range(start, end);
  }

  let result: vscode.TextEdit[] = [];
  let content = document.getText(range);

  let args = {
    source: content,
    mode: "beautify"
  };

  switch (document.languageId) {
    case "css":
      args["lang"] = "css";
      break;
    case "less":
      args["lang"] = "css";
      break;
    case "sass":
      args["lang"] = "css";
      break;
    default:
      break;
  }

  let settings = vscode.workspace.getConfiguration("sfmt");
  for (let attrname in settings) { args[attrname] = settings[attrname]; }

  let output = prettydiff.api(args);
  result.push(new vscode.TextEdit(range, output[0]));

  return result;
}

export function activate(context: vscode.ExtensionContext) {

  let docType: Array<string> = ["css", "less", "sass"];

  docType.forEach(element => {
    registerDocType(element);
  });

  function registerDocType(type) {
        context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(type, {
            provideDocumentFormattingEdits: (document, options, token) => {
                return format(document, null, options);
            }
        }));
        context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(type, {
            provideDocumentRangeFormattingEdits: (document, range, options, token) => {
                let start = new vscode.Position(0, 0);
                let end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
                return format(document, new vscode.Range(start, end), options);
            }
        }));
  }
}