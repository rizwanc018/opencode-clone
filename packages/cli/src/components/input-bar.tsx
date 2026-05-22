import type { KeyBinding, TextareaRenderable } from "@opentui/core";
import { useRenderer } from "@opentui/react";
import { useCallback, useEffect, useRef } from "react";
import { useToast } from "../providers/toast";
import { EmptyBorder } from "./border";
import { CommandMenu } from "./command-menu";
import type { Command } from "./command-menu/types";
import { useCommandMenu } from "./command-menu/use-command-menu";
import StatusBar from "./status-bar";

type Props = {
    onSubmit: (text: string) => void;
    disabled?: boolean;
};

export const TEXTAREA_KEY_BINDINGS: KeyBinding[] = [
    { name: "return", action: "submit" },
    { name: "enter", action: "submit" },
    { name: "return", shift: true, action: "newline" },
    { name: "enter", shift: true, action: "newline" },
];

const InputBar = ({ onSubmit, disabled }: Props) => {
    const textareaRef = useRef<TextareaRenderable>(null);
    const onSubmitRef = useRef<() => void>(() => {});
    const renderer = useRenderer();
    const toast = useToast();
    const {
        showCommandMenu,
        commandQuery,
        selectedIndex,
        scrollRef,
        handleContentChange,
        resolveCommand,
        setSelectedIndex,
    } = useCommandMenu();

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.onSubmit = () => {
            onSubmitRef.current();
        };
    }, []);

    const handleTextareaContentChange = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        handleContentChange(textarea.plainText);
    }, []);

    const handleSubmit = useCallback(() => {
        if (disabled) return;

        const textarea = textareaRef.current;
        if (!textarea) return;

        const text = textarea.plainText.trim();
        if (text.length === 0) return;

        onSubmit(text);
        textarea.setText("");
    }, [disabled, onSubmit]);

    const handleCommand = useCallback(
        (command: Command | undefined) => {
            const textarea = textareaRef.current;
            if (!textarea || !command) return;

            textarea.setText("");

            if (command.action) {
                command.action({
                    exit: () => renderer.destroy(),
                    toast,
                });
            } else {
                textarea.insertText(command.value + " ");
            }
        },
        [renderer, toast],
    );

    onSubmitRef.current = () => {
        if (disabled) return;

        if (showCommandMenu) {
            const command = resolveCommand(selectedIndex);
            handleCommand(command);
            return;
        }

        handleSubmit();
    };

    const handleCommandExecute = useCallback(
        (index: number) => {
            const command = resolveCommand(index);
            handleCommand(command);
        },
        [resolveCommand, handleCommand],
    );

    return (
        <box width="100%" alignItems="center">
            <box
                border={["left"]}
                borderColor="cyan"
                width="100%"
                customBorderChars={{
                    ...EmptyBorder,
                    vertical: "┃",
                    bottomLeft: "╹",
                }}
            >
                <box
                    position="relative"
                    justifyContent="center"
                    paddingX={2}
                    paddingY={1}
                    backgroundColor="#1A1A24"
                    width="100%"
                    gap={1}
                >
                    {showCommandMenu && (
                        <box
                            position="absolute"
                            bottom="100%"
                            left={0}
                            width="100%"
                            backgroundColor="#1A1A24"
                            zIndex={10}
                        >
                            <CommandMenu
                                query={commandQuery}
                                selectedIndex={selectedIndex}
                                scrollRef={scrollRef}
                                onSelect={setSelectedIndex}
                                onExecute={handleCommandExecute}
                            />
                        </box>
                    )}
                    <textarea
                        ref={textareaRef}
                        focused={!disabled}
                        placeholder="Ask me anything..."
                        keyBindings={TEXTAREA_KEY_BINDINGS}
                        onContentChange={handleTextareaContentChange}
                    />
                    <StatusBar />
                </box>
            </box>
        </box>
    );
};

export default InputBar;
