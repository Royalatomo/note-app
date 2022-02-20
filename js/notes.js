// Note Object
import { displayAllNotes, makeMoreOptionsIconFunction } from "./helper/note/noteHF.js";
import { makeNotesViewable, createNote, makeRemoveLabel } from "./helper/allHF.js";

// Populate Notes into notes area
displayAllNotes();
makeNotesViewable();
makeMoreOptionsIconFunction();
makeRemoveLabel();

// add note create button
createNote();