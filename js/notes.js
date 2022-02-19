// Note Object
import { displayAllNotes, makeMoreOptionsIconFunction } from "./helper/note/noteHF.js";
import { makeNotesViewable, createNote } from "./helper/allHF.js";

// Populate Notes into notes area
displayAllNotes();
createNote();
makeNotesViewable();
makeMoreOptionsIconFunction();