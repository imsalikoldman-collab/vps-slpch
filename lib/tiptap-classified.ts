import { Mark, mergeAttributes } from "@tiptap/core";

export const ClassifiedMark = Mark.create({
  name: "classified",

  parseHTML() {
    return [{ tag: "span[data-classified='true']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-classified": "true",
        class: "classified-token",
      }),
      0,
    ];
  },
});
