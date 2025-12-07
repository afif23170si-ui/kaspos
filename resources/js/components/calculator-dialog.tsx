import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CalculatorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CalculatorDialog({ open, onOpenChange }: CalculatorDialogProps) {
    const [display, setDisplay] = useState("");
    const [history, setHistory] = useState<string[]>([]);

    const handleClick = (value: string) => {
        setDisplay((prev) => prev + value);
    };

    const handleAllClear = () => {
        setDisplay("");
        setHistory([]);
    };

    const handleDelete = () => {
        setDisplay((prev) => prev.slice(0, -1));
    };

    const handleCalculate = () => {
        try {
            let expr = display;

            // Step 1: Ganti ekspresi seperti: 100 + 20% → 100 + (100 * 20 / 100)
            expr = expr.replace(
                /(\d+(\.\d+)?)(\s*[\+\-]\s*)(\d+(\.\d+)?)%/g,
                (_, left, _1, operator, percent) => {
                    return `${left}${operator}(${left} * ${percent} / 100)`;
                }
            );

            // Step 2: Ganti ekspresi seperti: 200 * 10% atau 300 / 50%
            expr = expr.replace(
                /(\d+(\.\d+)?)(\s*[\*\/]\s*)(\d+(\.\d+)?)%/g,
                (_, left, _2, operator, percent) => {
                    return `${left}${operator}(${percent} / 100)`;
                }
            );

            // Step 3: Ganti sisa % tanpa konteks (harus 0), contohnya 0 + 10% + 5%
            expr = expr.replace(/(^|[\+\-\*\/]\s*)\(?(\d+(\.\d+)?)%\)?/g, (_, prefix, num) => {
                return `${prefix}(0 * ${num} / 100)`; // diasumsikan base-nya 0
            });

            const result = eval(expr);
            const newEntry = `${display} = ${result}`;
            setHistory((prev) => [newEntry, ...prev].slice(0, 3));
            setDisplay(result.toString());
        } catch {
            setDisplay("Error");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm p-4">
                <DialogHeader>
                    <DialogTitle className="text-center text-lg">Kalkulator</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    {/* Display dan History */}
                    <div className="rounded border px-3 py-2 bg-muted min-h-[5rem]">
                        <div className="text-right text-xs text-muted-foreground space-y-0.5 mb-1">
                            {history.map((entry, index) => (
                                <div key={index} className="truncate">
                                    {entry}
                                </div>
                            ))}
                        </div>
                        <div className="text-right font-mono text-2xl">{display || "0"}</div>
                    </div>

                    {/* Tombol */}
                    <div className="grid grid-cols-4 gap-2">
                        {/* Baris 1 */}
                        <Button variant="destructive" className="py-6" onClick={handleAllClear}>C</Button>
                        <Button variant="outline" className="py-6 text-xl" onClick={handleDelete}>←</Button>
                        <Button variant="secondary" className="py-6 text-2xl" onClick={() => handleClick("%")}>%</Button>
                        <Button variant="secondary" className="py-6 text-2xl" onClick={() => handleClick("/")}>÷</Button>

                        {/* Baris 2 */}
                        <Button variant="outline" className="py-6" onClick={() => handleClick("7")}>7</Button>
                        <Button variant="outline" className="py-6" onClick={() => handleClick("8")}>8</Button>
                        <Button variant="outline" className="py-6" onClick={() => handleClick("9")}>9</Button>
                        <Button variant="secondary" className="py-6 text-2xl" onClick={() => handleClick("*")}>×</Button>

                        {/* Baris 3 */}
                        <Button variant="outline" className="py-6" onClick={() => handleClick("4")}>4</Button>
                        <Button variant="outline" className="py-6" onClick={() => handleClick("5")}>5</Button>
                        <Button variant="outline" className="py-6" onClick={() => handleClick("6")}>6</Button>
                        <Button variant="secondary" className="py-6 text-2xl" onClick={() => handleClick("-")}>−</Button>

                        {/* Baris 4 */}
                        <Button variant="outline" className="py-6" onClick={() => handleClick("1")}>1</Button>
                        <Button variant="outline" className="py-6" onClick={() => handleClick("2")}>2</Button>
                        <Button variant="outline" className="py-6" onClick={() => handleClick("3")}>3</Button>
                        <Button variant="secondary" className="py-6 text-2xl" onClick={() => handleClick("+")}>+</Button>

                        {/* Baris 5 */}
                        <Button variant="outline" className="col-span-2 py-6" onClick={() => handleClick("0")}>0</Button>
                        <Button variant="outline" className="py-6" onClick={() => handleClick(".")}>.</Button>
                        <Button variant="default" className="py-6 text-2xl" onClick={handleCalculate}>=</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
