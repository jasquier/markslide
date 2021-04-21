#! /usr/bin/env node

import fs from "fs";
import readline from "readline";
import { Key } from "node:readline";

// Ensure proper usage
if (process.argv.length !== 3) {
  console.error("usage: markslide <file.md>");
  process.exit(1);
}

// Read the file and split into slides
const file = process.argv[2];
const text = fs.readFileSync(file, "utf8");
const slides = text.split(/---+\n/);
let index = 0;

// Check slide format
if (slides.length <= 1) {
  console.error("markdown should be split into slides using --- breaks");
  process.exit(1);
}

// Setup process.stdin
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// Removes all characters from the terminal
const clearOutput = () => {
  process.stdout.write("\u001B[2J\u001B[0;0f");
};

// Handles the showing of slides and manages index boundaries
const show = () => {
  if (index < 0) index = 0;
  if (index >= slides.length) index = slides.length - 1;

  clearOutput();
  console.log(slides[index]);
};

// Map key conditions to actions
const mappings: Record<string, Entry> = {
  exit: {
    conditions: [(k) => !!k.ctrl && k.name === "c", (k) => k.name === "q"],
    actions: () => {
      clearOutput();
      process.exit(0);
    },
  },
  nextSlide: {
    conditions: [(k) => k.name === "j"],
    actions: () => {
      index += 1;
    },
  },
  previousSlide: {
    conditions: [(k) => k.name === "k"],
    actions: () => {
      index -= 1;
    },
  },
  endOfSlides: {
    conditions: [(k) => k.sequence === "$"],
    actions: () => {
      index = slides.length - 1;
    },
  },
  beginningOfSlides: {
    conditions: [(k) => k.name === "0"],
    actions: () => {
      index = 0;
    },
  },
};

// Start the slides
show();

// On each key press
process.stdin.on("keypress", (str, key) => {
  // Go through the mappings
  for (const entry in mappings) {
    const { conditions, actions } = mappings[entry];
    // Check the conditions
    if (conditions.some((predicate) => predicate(key))) {
      // If any condition matches, perform the actions and then show
      actions();
      show();
      return;
    }
  }
});

type Predicate = (k: Key) => boolean;

interface Entry {
  conditions: Array<Predicate>;
  actions: () => void;
}
