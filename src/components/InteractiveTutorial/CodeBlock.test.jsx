import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CodeBlock, RunButton } from "./CodeBlock";
import * as requestFromCodeMod from "../CodeEditorWindow/config/RequesFromCode";

const props = {
  children: {
    props: {
      className: "language-json",
      children: "{\n  \"name\": \"test\"\n}",
      withRunButton: "true",
    },
  },
};

const requestFromCodeSpy = vi.spyOn(
  requestFromCodeMod,
  "requestFromCode",
).mockImplementation(() => new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: "ok" });
    }, 100);
  }),
);

describe("CodeBlock", () => {
  it("should render RunButton with given code", () => {
    render(<RunButton code={props.children.props.children}/>);

    expect(screen.getByTestId("code-block-run")).toBeInTheDocument();
    expect(screen.getByText(/Run/)).toBeInTheDocument();
  });

  it("should call requestFromCode with given code", () => {

    render(<RunButton code={props.children.props.children}/>);
    screen.getByTestId("code-block-run").click();

    expect(requestFromCodeSpy).
      toHaveBeenCalledWith("{\n  \"name\": \"test\"\n}", false);
  });

  it("should render CodeBlock with given code", () => {
    render(<CodeBlock {...props} />);

    expect(screen.getByTestId("code-block")).toBeInTheDocument();
    expect(screen.getByTestId("code-block-pre")).toBeInTheDocument();
    expect(screen.getByTestId("code-block-run")).toBeInTheDocument();
    expect(screen.getByText(/{/)).toBeInTheDocument();
    expect(screen.getByText(/"name": "test"/)).toBeInTheDocument();
    expect(screen.getByText(/}/)).toBeInTheDocument();
    expect(screen.getByText(/Run/)).toBeInTheDocument();
  });

  it("should render CodeBlock without run button", () => {
    props.children.props.withRunButton = "false";
    render(<CodeBlock {...props} />);

    expect(screen.getByTestId("code-block")).toBeInTheDocument();
    expect(screen.getByTestId("code-block-pre")).toBeInTheDocument();
    expect(screen.queryByTestId("code-block-run")).not.toBeInTheDocument();
  });
});
