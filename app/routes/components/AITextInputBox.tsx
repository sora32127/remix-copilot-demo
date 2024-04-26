import { FormEvent, useCallback, useEffect, useRef, useState } from "react"

export default function AITextInputBox() {
    const [suggestions, setSuggestions] = useState<string | null>(null);
    const textarea = useRef<HTMLTextAreaElement>(null);
    const timer = useRef<NodeJS.Timeout | null>(null);

    const handleInputValue = (e: FormEvent<HTMLTextAreaElement>) => {
        if (timer.current){
            clearTimeout(timer.current);
        }

        if (e.currentTarget.value){
            const text = e.currentTarget.value;
            timer.current = setTimeout(async () => {
                try {
                    const formData = new FormData();
                    formData.append("text", text);
                    const response = await fetch("/api/ai/getCompletion", {
                        method: "POST",
                        body: formData
                    });
                    const suggestion = await response.json();
                    setSuggestions(suggestion);
                } catch (error) {
                    console.error(error);
                }
            }, 1000)
        }
    }

    const commitSuggestions = useCallback(() =>{
        const textareaElement = textarea.current;
        if (textareaElement && suggestions){
            const newValue = textareaElement.value + suggestions;
            textareaElement.value = newValue;
            textareaElement.focus();
            setSuggestions(null);
        }
    }, [suggestions])

    const handleSuggestions = useCallback((e: KeyboardEvent) => {
        if (e.key === "Shift"){
            e.preventDefault();
            commitSuggestions();
        }
    },[commitSuggestions])

    useEffect(() => {
        if (suggestions){
            addEventListener("keydown", handleSuggestions);
        }
        return () => {
            removeEventListener("keydown", handleSuggestions);
        }
    }, [handleSuggestions, suggestions])

    return (
        <>
         <textarea
            ref={textarea}
            onChange={handleInputValue}
         />
            {suggestions && (
                <div>
                    <p>[補完候補]: {suggestions}</p>
                    <p>Shiftキーまたはボタンを押して補完できます</p>
                    <button onClick={commitSuggestions}>補完する</button>   
                </div>
            )}
        </>
    )
}