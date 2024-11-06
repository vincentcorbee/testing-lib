export const css = `
.material-symbols-outlined {
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 24
}

:host {
  --ui-file-explorer-folder-label-size: 12px;
  --ui-file-explorer-file-label-size: 12px;
  --ui-file-explorer-list-padding-left: 16px;
  --ui-file-explorer-content-padding: 16px;
  --ui-file-explorer-header-padding: 8px;
  --ui-file-explorer-shape: 5px;
  --ui-file-explorer-folder-icon-size: 18px;
  --ui-file-explorer-list-item-padding-top: 4px;
  --ui-file-explorer-list-item-padding-bottom: 4px;

  display: block;
  /* position: fixed; */
  top: 8px;
  left: 8px;
  z-index: 9999;
  background-color: white;
  font-family: 'Roboto', sans-serif;
  color: hsl(336, 9%, 89%);
  min-width: 240px;
}

.ui-file-explorer__container {
  box-shadow: 1px 1px 5px 2px hsl(0, 0%, 0%, 0.2);
  border-radius: var(--ui-file-explorer-shape);
  background-color: hsl(300, 3%, 8%);
  overflow: hidden;
  height: 100%;
}

.ui-file-explorer__header {
  background-color: hsl(300, 3%, 13%);
  padding: var(--ui-file-explorer-header-padding);\
  display: flex;
}

.ui-file-explorer__content {
  padding: var(--ui-file-explorer-content-padding);
}

.ui-file-explorer__buttons {
  display: flex;
}

.ui-file-explorer__header button {
  background-color: hsl(30, 100%, 55%);
  border-radius: 100%;
  width: 12px;
  height: 12px;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  display: block;
}

.ui-file-explorer__content > ul {
  padding-left: 0;
}

ul {
  padding-left: var(--ui-file-explorer-list-padding-left);
  list-style-type: none;
  margin-top: 0;
  margin-bottom:0;
}

li > div {
  display: flex;
  align-items: center;
}

li > div:first-child {
  cursor: pointer;
  padding-top: var(--ui-file-explorer-list-item-padding-top);
  padding-bottom: var(--ui-file-explorer-list-item-padding-bottom);
}

li > div:first-child > span:first-child {
  margin-right: 8px;
  pointer-events: none;
  font-size: var(--ui-file-explorer-folder-icon-size);
}

div[data-type="folder"] > span:nth-child(2) {
  font-size: var(--ui-file-explorer-folder-label-size);
  pointer-events: none;
}

div[data-type="folder"][aria-expanded="false"] + ul {
  display: none;
}

div[data-type="file"] > span:nth-child(2) {
  font-size: var(--ui-file-explorer-file-label-size);
  pointer-events: none;
}
`;
