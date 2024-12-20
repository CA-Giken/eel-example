/**
 * DescriptionFieldへのテキスト表示用イベントリスナー
 **/

// CSVファイルのキャッシュ
globalThis.jsonCache = {};

async function loadJsonFile(filepath) {
  var filename = filepath.replace(".csv", "");

  if (jsonCache[filename]) {
    return jsonCache[filename];
  }

  try {
    const res = await fetch(`/${filename}.json`);
    const data = await res.json();
    jsonCache[filename] = data;
    return data;
  } catch (e) {
    console.error("Error loading JSON:", e);
    return null;
  }
}

async function updateDescription(payload) {
  const { element, detail } = payload;
  if (!detail) {
    return;
  }
  const { rowId, csvFilename } = detail;
  console.log("updateDescription", detail);
  if (!rowId) {
    return;
  }
  if (!csvFilename) {
    return;
  }

  const jsonData = await loadJsonFile(csvFilename);
  if (!jsonData) {
    console.error(
      "No description available: CSV file not found. This is caused by missing CSV file, failed to convert to JSON, or failed to load from cache."
    );
    return;
  }

  const rowData = jsonData.find((row) => row.id === rowId);
  if (!rowData) {
    console.error("No description available: Row not found");
    return;
  }

  // テキスト更新
  // クラス名にdescription-fieldが指定されている要素を取得してテキストを更新する
  const fields = element.querySelectorAll(".description-field");
  fields.forEach((field) => {
    field.textContent = rowData[field.dataset.columnName];
  });
}

document.addEventListener("DOMContentLoaded", (e) => {
  var elements = document.getElementsByClassName("description");
  for (const el of elements) {
    domUpdateHelper.registerCallback(el, updateDescription);

    const eventName = el.dataset.eventName;
    document.addEventListener(eventName, (event) => {
      const payload = {
        detail: event.detail,
      };
      domUpdateHelper.executeCallbacks(el, payload);
    });
  }
});