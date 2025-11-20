"use client";
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Beaker,
  Download,
  Sparkles,
  BarChart3,
  Zap,
  TrendingUp,
} from "lucide-react";
import LoadingLayout from "./utils/LoadingLayout";

export default function MainConsole() {
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState([0.7]);
  const [topP, setTopP] = useState([0.9]);
  const [numVariations, setNumVariations] = useState([3]);
  const [responses, setResponses] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateResponses = async () => {
    setIsGenerating(true);

    const minTemp = 0;
    const maxTemp = 2;
    const tempDelta = 0.2; // max random variation

    const minTopP = 0;
    const maxTopP = 1;
    const topPDelta = 0.1; // max random variation

    // create N param variations
    const params = [];
    for (let i = 0; i < numVariations[0]; i++) {
      const tempVar = temperature[0] + (Math.random() - 0.5) * 2 * tempDelta;
      const topPVar = topP[0] + (Math.random() - 0.5) * 2 * topPDelta;

      params.push({
        temperature: parseFloat(
          Math.min(maxTemp, Math.max(minTemp, tempVar)).toFixed(2)
        ),
        top_p: parseFloat(
          Math.min(maxTopP, Math.max(minTopP, topPVar)).toFixed(2)
        ),
      });
    }

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_LLM_BACKEND + "/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          params,
        }),
      });

      const data = await res.json();
      setResponses(
        data.experiment.results.map((item, idx) => ({
          id: idx + 1,
          temperature: item.temperature,
          topP: item.top_p,
          response: item.response,
          metrics: item.metrics,
        }))
      );
    } catch (err) {
      console.error("API error:", err);
      alert("Failed to connect to backend!");
    }

    setIsGenerating(false);
  };

  const exportData = () => {
    const data = {
      prompt,
      responses,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `llm-lab-experiment-${Date.now()}.json`;
    a.click();
  };

  const getMetricColor = (value) => {
    if (value >= 0.8) return "text-green-600";
    if (value >= 0.6) return "text-yellow-600";
    return "text-orange-600";
  };

  const getBestResponse = () => {
    if (responses.length === 0) return null;
    const best = responses.reduce((best, current) => {
      return current?.metrics?.avg_score > best?.metrics?.avg_score
        ? current
        : best;
    });
    return best;
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        setPrompt(data.prompt);

        if (data.parameters) {
          setTemperature([data.parameters.temperature]);
          setTopP([data.parameters.topP]);
        }

        if (data.responses) {
          setResponses(
            data.responses.map((item, idx) => ({
              id: idx + 1,
              temperature: item.temperature,
              topP: item.topP,
              response: item?.response,
              metrics: item?.metrics ?? {},
            }))
          );
        }
      } catch (error) {
        console.error("Invalid JSON:", error);
        alert("Invalid JSON file format.");
      } finally {
        e.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  LLM Lab
                </h1>
                <p className="text-xs text-slate-500">
                  Parameter Experimentation Console
                </p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Beta</span>
            </Badge>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2 hover:border-indigo-200 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  Experiment Setup
                </CardTitle>
                <CardDescription>Configure your LLM parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Input Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] resize-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Temperature</Label>
                      <Badge variant="secondary">
                        {temperature[0].toFixed(2)}
                      </Badge>
                    </div>
                    <Slider
                      value={temperature}
                      onValueChange={setTemperature}
                      min={0}
                      max={2}
                      step={0.1}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">
                      Controls randomness (0 = focused, 2 = creative)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Top P</Label>
                      <Badge variant="secondary">{topP[0].toFixed(2)}</Badge>
                    </div>
                    <Slider
                      value={topP}
                      onValueChange={setTopP}
                      min={0}
                      max={1}
                      step={0.05}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">
                      Nucleus sampling threshold
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Variations</Label>
                      <Badge variant="secondary">{numVariations[0]}</Badge>
                    </div>
                    <Slider
                      value={numVariations}
                      onValueChange={setNumVariations}
                      min={1}
                      max={5}
                      step={1}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">
                      Number of responses to generate
                    </p>
                  </div>
                </div>

                <Button
                  onClick={generateResponses}
                  disabled={!prompt || isGenerating}
                  className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Responses
                    </>
                  )}
                </Button>

                {responses.length > 0 && (
                  <Button
                    onClick={exportData}
                    variant="outline"
                    className="w-full hover:bg-slate-50 transition-colors"
                    disabled={isGenerating}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Experiments
                  </Button>
                )}
                <input
                  type="file"
                  accept="application/json"
                  id="importFile"
                  hidden
                  disabled={isGenerating}
                  onChange={handleImport}
                />

                <Button
                  variant="outline"
                  className="w-full hover:bg-slate-50 transition-colors"
                  onClick={() => document.getElementById("importFile").click()}
                >
                  Import Experiments
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Results */}
          {isGenerating ? (
            <LoadingLayout />
          ) : (
            <div className="lg:col-span-2 space-y-6">
              {responses.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200">
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 bg-slate-100 rounded-full mb-4">
                      <BarChart3 className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                      No experiments yet
                    </h3>
                    <p className="text-slate-500 max-w-md">
                      Configure your parameters and generate responses to see
                      analysis and comparisons
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="responses" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="responses">Response Cards</TabsTrigger>
                    <TabsTrigger value="comparison">
                      Comparison Table
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="responses" className="space-y-4">
                    {getBestResponse() && (
                      <Card className="border-2 border-green-200 bg-green-50/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-700">
                            <TrendingUp className="w-5 h-5" />
                            Best Performing Response
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-4 mb-3">
                            <Badge variant="outline" className="gap-1">
                              Temp: {getBestResponse().temperature}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              Top-P: {getBestResponse().topP}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed mb-4">
                            <div className="prose prose-neutral max-w-none">
                              <ReactMarkdown>
                                {getBestResponse().response}
                              </ReactMarkdown>
                            </div>
                          </p>
                          <div className="grid grid-cols-4 gap-3">
                            {Object.entries(getBestResponse().metrics).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="text-center p-2 bg-white rounded-lg"
                                >
                                  <div
                                    className={`text-lg font-bold ${getMetricColor(
                                      value
                                    )}`}
                                  >
                                    {(value * 100).toFixed(0)}%
                                  </div>
                                  <div className="text-xs text-slate-500 capitalize">
                                    {key}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {responses.map((response) => (
                      <Card
                        key={response.id}
                        className="hover:shadow-lg transition-all duration-300 border hover:border-indigo-200"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Response #{responses.indexOf(response) + 1}
                            </CardTitle>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="gap-1">
                                Temp: {response.temperature}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                Top-P: {response.topP}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="prose prose-neutral max-w-none">
                            <ReactMarkdown>{response.response}</ReactMarkdown>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Object.entries(response.metrics).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="text-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                  <div
                                    className={`text-xl font-bold ${getMetricColor(
                                      value
                                    )}`}
                                  >
                                    {(value * 100).toFixed(0)}%
                                  </div>
                                  <div className="text-xs text-slate-500 capitalize mt-1">
                                    {key}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="comparison">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-indigo-600" />
                          Parameter Comparison
                        </CardTitle>
                        <CardDescription>
                          Side-by-side analysis of all responses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="text-left p-3 font-semibold text-sm">
                                  #
                                </th>
                                <th className="text-left p-3 font-semibold text-sm">
                                  Temperature
                                </th>
                                <th className="text-left p-3 font-semibold text-sm">
                                  Top-P
                                </th>
                                <th className="text-left p-3 font-semibold text-sm">
                                  Coherence
                                </th>
                                <th className="text-left p-3 font-semibold text-sm">
                                  Relevance
                                </th>
                                <th className="text-left p-3 font-semibold text-sm">
                                  Completeness
                                </th>
                                <th className="text-left p-3 font-semibold text-sm">
                                  Diversity
                                </th>
                                <th className="text-left p-3 font-semibold text-sm">
                                  Avg Score
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {responses.map((response, idx) => {
                                const avgScore =
                                  response.metrics.avg_score.toFixed(2);
                                return (
                                  <tr
                                    key={response.id}
                                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                  >
                                    <td className="p-3 font-medium">
                                      {idx + 1}
                                    </td>
                                    <td className="p-3">
                                      {response.temperature}
                                    </td>
                                    <td className="p-3">{response.topP}</td>
                                    <td
                                      className={`p-3 font-medium ${getMetricColor(
                                        response.metrics.coherence
                                      )}`}
                                    >
                                      {(
                                        response.metrics.coherence * 100
                                      ).toFixed(0)}
                                      %
                                    </td>
                                    <td
                                      className={`p-3 font-medium ${getMetricColor(
                                        response.metrics.relevance
                                      )}`}
                                    >
                                      {(
                                        response.metrics.relevance * 100
                                      ).toFixed(0)}
                                      %
                                    </td>
                                    <td
                                      className={`p-3 font-medium ${getMetricColor(
                                        response.metrics.completeness
                                      )}`}
                                    >
                                      {(
                                        response.metrics.completeness * 100
                                      ).toFixed(0)}
                                      %
                                    </td>
                                    <td
                                      className={`p-3 font-medium ${getMetricColor(
                                        response.metrics.diversity
                                      )}`}
                                    >
                                      {(
                                        response.metrics.diversity * 100
                                      ).toFixed(0)}
                                      %
                                    </td>
                                    <td className="p-3">
                                      <Badge
                                        variant={
                                          parseFloat(avgScore) >= 0.75
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {(parseFloat(avgScore) * 100).toFixed(
                                          0
                                        )}
                                        %
                                      </Badge>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
