import { getAutocompleteArray } from "./config/Autocomplete";
import { describe, it, expect } from "vitest";

describe("Autocomplete", () => {
  it("1st", () => {
    const array = getAutocompleteArray("GET c");
    expect(array).toEqual([
      {
        label: "metrics",
        kind: 17,
        insertText: "metrics",
      },
      {
        label: "locks",
        kind: 17,
        insertText: "locks",
      },
      {
        label: "cluster",
        kind: 17,
        insertText: "cluster",
      },
      {
        label: "collections",
        kind: 17,
        insertText: "collections",
      },
    ]);
  });
  it("2nd", () => {
    const array = getAutocompleteArray("GET collectio");
    expect(array).toEqual([
      {
        label: "collections",
        kind: 17,
        insertText: "collections",
      },
    ]);
  });
  it("3rd", () => {
    const array = getAutocompleteArray("G");
    expect(array).toEqual([
      {
        insertText: "POST",
        kind: 17,
        label: "Method:POST",
      },
      {
        insertText: "GET",
        kind: 17,
        label: "Method:GET",
      },
      {
        insertText: "PUT",
        kind: 17,
        label: "Method:PUT",
      },
      {
        insertText: "DELETE",
        kind: 17,
        label: "Method:DELETE",
      },
      {
        insertText: "HEAD",
        kind: 17,
        label: "Method:HEAD",
      },
    ]);
  });
  it("3rd", () => {
    const array = getAutocompleteArray("GET cl");
    expect(array).toEqual([
      {
        insertText: "cluster",
        kind: 17,
        label: "cluster",
      },
      {
        insertText: "collections",
        kind: 17,
        label: "collections",
      },
    ]);
  });
  it("4th", () => {
    const array = getAutocompleteArray("GET loc");
    expect(array).toEqual([
      {
        insertText: "locks",
        kind: 17,
        label: "locks",
      },
    ]);
  });
  it("5th", () => {
    const array = getAutocompleteArray("GET collections \nGET met");
    expect(array).toEqual([
      {
        insertText: "telemetry",
        kind: 17,
        label: "telemetry",
      },
      {
        insertText: "metrics",
        kind: 17,
        label: "metrics",
      },
    ]);
  });
  it("6th", () => {
    const array = getAutocompleteArray("GET collections \nGET metrics \nGET ");
    expect(array).toEqual([
      {
        insertText: "telemetry",
        kind: 17,
        label: "telemetry",
      },
      {
        insertText: "metrics",
        kind: 17,
        label: "metrics",
      },
      {
        insertText: "locks",
        kind: 17,
        label: "locks",
      },
      {
        insertText: "cluster",
        kind: 17,
        label: "cluster",
      },
      {
        insertText: "collections",
        kind: 17,
        label: "collections",
      },
      {
        insertText: "aliases",
        kind: 17,
        label: "aliases",
      },
      {
        insertText: "snapshots",
        kind: 17,
        label: "snapshots",
      },
    ]);
  });
  it("7th", () => {
    const array = getAutocompleteArray(
      "GET collections \nGET metrics \nGET telemetry \nGET collections/name"
    );
    expect(array).toEqual([
      {
        insertText: "aliases",
        kind: 17,
        label: "aliases",
      },
    ]);
  });
  it("8th", () => {
    const array = getAutocompleteArray(
      "GET collections/name \nGET collections/name/snapsshots/"
    );
    expect(array).toEqual([
      {
        insertText: "upload",
        kind: 17,
        label: "upload",
      },
      {
        insertText: "recover",
        kind: 17,
        label: "recover",
      },
      {
        insertText: "delete",
        kind: 17,
        label: "delete",
      },
      {
        insertText: "payload",
        kind: 17,
        label: "payload",
      },
      {
        insertText: "scroll",
        kind: 17,
        label: "scroll",
      },
      {
        insertText: "search",
        kind: 17,
        label: "search",
      },
      {
        insertText: "recommend",
        kind: 17,
        label: "recommend",
      },
      {
        insertText: "count",
        kind: 17,
        label: "count",
      },
    ]);
  });

  it("9th", () => {
    const array = getAutocompleteArray(
      "GET collections/name/snapsshots/ \nGET collections/name/snapsshots/uplo"
    );
    expect(array).toEqual([
      {
        insertText: "upload",
        kind: 17,
        label: "upload",
      },
      {
        insertText: "recover",
        kind: 17,
        label: "recover",
      },
      {
        insertText: "delete",
        kind: 17,
        label: "delete",
      },
      {
        insertText: "payload",
        kind: 17,
        label: "payload",
      },
      {
        insertText: "scroll",
        kind: 17,
        label: "scroll",
      },
      {
        insertText: "search",
        kind: 17,
        label: "search",
      },
      {
        insertText: "recommend",
        kind: 17,
        label: "recommend",
      },
      {
        insertText: "count",
        kind: 17,
        label: "count",
      },
    ]);
  });
});
