"use client";

import { useState } from "react";
import * as authActions from "@/lib/auth/actions";
import * as notesActions from "@/lib/notes/actions";
import * as gradesActions from "@/lib/grades/actions";

export default function TestActionsPage() {
  const [log, setLog] = useState<any[]>([]);

  const [username, setUsername] = useState("testuser");
  const [password, setPassword] = useState("password123");
  const [classId, setClassId] = useState(1);
  const [ruleId, setRuleId] = useState(1);
  const [noteId, setNoteId] = useState(1);
  const [recordId, setRecordId] = useState(1);
  const [value, setValue] = useState(10);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [content, setContent] = useState("Test note content");

  const [ruleName, setRuleName] = useState("Giữa kỳ");
  const [ruleType, setRuleType] = useState<"INPUT" | "ACCUMULATE">("INPUT");
  const [weightPercent, setWeightPercent] = useState(30);

  const addLog = (actionName: string, result: any) => {
    setLog((prev) => [
      { actionName, result, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  const handle = async (name: string, fn: () => Promise<any>) => {
    try {
      const res = await fn();
      addLog(name, res);
    } catch (error: any) {
      addLog(name, { error: error.message });
    }
  };

  const InputField = ({ label, value, onChange, type = "text" }: any) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        className="border border-gray-300 p-1 rounded text-sm text-black"
        type={type}
        value={value}
        onChange={(e) =>
          onChange(type === "number" ? Number(e.target.value) : e.target.value)
        }
      />
    </div>
  );

  return (
    <div className="p-4 flex gap-4 font-sans bg-gray-50 text-black max-w-7xl mx-auto w-full flex-1 h-[calc(100vh-64px)]">
      {/* Cột trái: Form nhập liệu và Nút */}
      <div className="w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 pb-8">
        <h1 className="text-2xl font-bold">Testing Lib Actions</h1>

        {/* Global Inputs */}
        <div className="p-4 bg-white rounded shadow flex flex-col gap-4">
          <h2 className="text-lg font-bold border-b pb-2">Global Variables</h2>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Username"
              value={username}
              onChange={setUsername}
            />
            <InputField
              label="Password"
              value={password}
              onChange={setPassword}
            />
            <InputField
              label="Class ID"
              value={classId}
              onChange={setClassId}
              type="number"
            />
            <InputField
              label="Rule ID"
              value={ruleId}
              onChange={setRuleId}
              type="number"
            />
            <InputField
              label="Note ID"
              value={noteId}
              onChange={setNoteId}
              type="number"
            />
            <InputField
              label="Record ID"
              value={recordId}
              onChange={setRecordId}
              type="number"
            />
            <InputField
              label="Value (Score/Unit)"
              value={value}
              onChange={setValue}
              type="number"
            />
            <InputField
              label="Date (YYYY-MM-DD)"
              value={date}
              onChange={setDate}
            />
            <InputField
              label="Note Content"
              value={content}
              onChange={setContent}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">
                Rule Type
              </label>
              <select
                className="border border-gray-300 p-1 rounded text-sm"
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as any)}
              >
                <option value="INPUT">INPUT</option>
                <option value="ACCUMULATE">ACCUMULATE</option>
              </select>
            </div>
            <InputField
              label="Rule Name"
              value={ruleName}
              onChange={setRuleName}
            />
            <InputField
              label="Weight %"
              value={weightPercent}
              onChange={setWeightPercent}
              type="number"
            />
          </div>
        </div>

        {/* Auth Actions */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">Auth Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("register", () =>
                  authActions.register(username, password),
                )
              }
            >
              register
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("login", () => authActions.login(username, password))
              }
            >
              login
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              onClick={() => handle("logout", () => authActions.logout())}
            >
              logout
            </button>
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("getCurrentUser", () => authActions.getCurrentUser())
              }
            >
              getCurrentUser
            </button>
          </div>
        </div>

        {/* Notes Actions */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">
            Notes Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("getNotesByDate", () =>
                  notesActions.getNotesByDate(date, classId),
                )
              }
            >
              getNotesByDate
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("saveNote", () =>
                  notesActions.saveNote(date, content, classId),
                )
              }
            >
              saveNote
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("deleteNote", () => notesActions.deleteNote(noteId))
              }
            >
              deleteNote
            </button>
          </div>
        </div>

        {/* Grades Actions */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">
            Grades Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("getRulesByClass", () =>
                  gradesActions.getRulesByClass(classId),
                )
              }
            >
              getRulesByClass
            </button>
            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("getRuleById", () => gradesActions.getRuleById(ruleId))
              }
            >
              getRuleById
            </button>
            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("createRule", () =>
                  gradesActions.createRule(classId, {
                    ruleName,
                    ruleType,
                    weightPercent,
                  }),
                )
              }
            >
              createRule
            </button>
            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("updateRule", () =>
                  gradesActions.updateRule(ruleId, { ruleName, weightPercent }),
                )
              }
            >
              updateRule
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("deleteRule", () => gradesActions.deleteRule(ruleId))
              }
            >
              deleteRule
            </button>

            <div className="w-full h-[1px] bg-gray-200 my-2"></div>

            <button
              className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("getInputRecords", () =>
                  gradesActions.getInputRecords(ruleId),
                )
              }
            >
              getInputRecords
            </button>
            <button
              className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("createInputRecord", () =>
                  gradesActions.createInputRecord(ruleId, value),
                )
              }
            >
              createInputRecord
            </button>
            <button
              className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("updateInputRecord", () =>
                  gradesActions.updateInputRecord(recordId, value),
                )
              }
            >
              updateInputRecord
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("deleteInputRecord", () =>
                  gradesActions.deleteInputRecord(recordId),
                )
              }
            >
              deleteInputRecord
            </button>

            <div className="w-full h-[1px] bg-gray-200 my-2"></div>

            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("getAccumulateRecords", () =>
                  gradesActions.getAccumulateRecords(ruleId),
                )
              }
            >
              getAccumulateRecords
            </button>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("createAccumulateRecord", () =>
                  gradesActions.createAccumulateRecord(ruleId, value),
                )
              }
            >
              createAccumulateRecord
            </button>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("updateAccumulateRecord", () =>
                  gradesActions.updateAccumulateRecord(recordId, value),
                )
              }
            >
              updateAccumulateRecord
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                handle("deleteAccumulateRecord", () =>
                  gradesActions.deleteAccumulateRecord(recordId),
                )
              }
            >
              deleteAccumulateRecord
            </button>
          </div>
        </div>
      </div>

      {/* Cột phải: Logs */}
      <div className="w-1/2 flex flex-col bg-gray-800 rounded shadow text-white p-4">
        <div className="flex justify-between items-center border-b border-gray-600 pb-2 mb-4">
          <h2 className="text-lg font-bold">Execution Logs</h2>
          <button
            className="text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
            onClick={() => setLog([])}
          >
            Clear
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
          {log.length === 0 && (
            <p className="text-gray-400 text-sm">
              No logs yet. Click a button to test an action.
            </p>
          )}
          {log.map((entry, idx) => (
            <div
              key={idx}
              className="bg-gray-900 p-3 rounded border border-gray-700"
            >
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="font-bold text-green-400">
                  {entry.actionName}
                </span>
                <span>{entry.time}</span>
              </div>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all text-gray-200">
                {JSON.stringify(entry.result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
