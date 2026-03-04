---
title: Introduction of Claude Skills and How to Use It
date: 2026-03-04T00:00:00.000Z
tags:
  - claude-code
  - ai-tools
  - skills
categories:
  - tech
slug: introduction-of-claude-skills
coverImage: 'https://img.waynspace.com/2026/03/Introduction-of-Claude-skills-and-how-to-use-it/claude-skills-cover.webp'
author:
  name: Wei-Ting Liu
  email: wayntingliu@gmail.com
seo:
  metaDescription: >-
    A comprehensive guide to Claude Code Skills — what they are, how to install
    and use them, and how to build your own custom skills for AI-assisted
    development.
  keywords:
    - Claude Code
    - Skills
    - AI-assisted development
    - ABConvert
summary: >-
  Returning to Claude Code during my internship at ABConvert, I rediscovered its powerful Skills system. This post covers what Skills are, how to install them from public repositories, practical usage in development workflows, and how to build your own custom skills to standardize AI-assisted development.
---

# Introduction of Claude skills and how to use it

![image.png](https://img.waynspace.com/2026/03/Introduction-of-Claude-skills-and-how-to-use-it/claude-skills-cover.webp)

## Outline

1. Recap: My Journey with Claude Code

   - First experience using Claude Code during my internship

   - Temporarily switching to Cursor during the semester

   - Returning to Claude Code after rejoining ABConvert

2. Installing Claude Code

   - Basic setup and official installation guide

3. What Are Claude Skills?

   - Definition of Skills

   - What a Skill typically contains

   - Why Skills improve AI-assisted development

4. Installing Skills from the Internet

   - Using the official Anthropic skills repository

   - Step-by-step installation

   - Managing and updating installed skills

5. Practical Usage: How to Use Skills in Claude Code

   - Selecting the right skill for a task

   - Referencing skills in prompts

   - Example workflow in real development tasks

6. Bonus: How to Build Your Own Skills

   - Creating custom skills

   - Structuring instructions and metadata

   - Integrating skills into your daily workflow

7. Conclusion

   - Reflections on using Claude Code in an AI-native workflow

   - Why Skills are an important concept for AI-assisted development

---

## Recap sequence

Because I recently returned to **ABConvert** for my internship—an AI-native company that actively encourages integrating tools such as **Claude Code** and even **OpenClaw** into daily workflows—I decided to write a short introduction about my journey with Claude Code.

First, let me briefly share how I started using it.

I began using **Claude Code in June 2025**, when I built [my personal website](https://www.waynspace.com) and several internal tools during my internship at ABConvert. At that time, Claude Code became one of the main assistants in my development workflow.

When the new semester started, I temporarily switched to **Cursor’s models**, mainly because of their free credits and the availability of a Pro plan.

As a result, I spent nearly **half a year without using Claude Code regularly**.

Now that I have returned to ABConvert for my internship again, I decided to revisit Claude Code and integrate it back into my workflow.

This post records **how I re-embraced Claude Code**, what has changed since the last time I used it, and how I am currently using it in my development process.

---

## How to install “Claude Code“

I assume all you guys have installed Claude code, if you don’t, you can refer to this post: <https://code.claude.com/docs/setup>

---

## What is “Skills“

> In **Claude Code**, **“Skills”** refer to modular capability packages that extend what Claude can do inside the coding environment. Think of Skills as **specialized toolkits** that give Claude structured knowledge, workflows, or integrations for specific tasks.

### What a Skill Usually Contains

A Skill can include:

1. **Domain-specific instructions**\
   Custom system prompts that define how Claude should behave for a task\
   (e.g., API review style, refactoring standards, security checklist)

2. **Predefined workflows**\
   Step-by-step procedures for tasks like:

   - Code review

   - API contract validation

   - Documentation generation

   - Migration planning

3. **Templates & output formats**\
   Structured output requirements (e.g., Markdown checklist, diff summary, risk table)

4. **Tool integrations (sometimes)**\
   Hooks into:

   - GitHub

   - CI pipelines

   - Testing frameworks

   - Internal APIs

### Why Skills Exist

Without Skills:

> You manually write long prompts every time.

With Skills:

> You activate a capability, and Claude follows a predefined structured methodology.

It improves:

- Consistency

- Reliability

- Reusability

- Team standardization

---

## How to install Skills from internet?

### 1\. Introduction

Claude Code supports modular capability extensions called **Skills**.\
Skills can be installed from public repositories, such as:

<https://github.com/anthropics/skills>

This guide explains how to install them locally and activate them in Claude Code.


### 2\. Prerequisites

Before installing a Skill, ensure you have:

- Claude Code installed

- Git installed (`git --version`)

- Node.js (if required by the skill)

- Proper filesystem access to Claude’s skills directory


### 3\. Step 1 — Locate Claude Code Skills Directory

Claude Code loads skills from a local directory.

Common locations:

### macOS

```plain
~/.claude/skills/
```

### Linux

```plain
~/.config/claude/skills/
```

### Windows

```plain
C:\Users\YOUR_NAME.claude\skills\
```

### 4\. Step 2 — Clone the Skill Repository

Navigate to your Claude skills directory:

```bash
cd ~/.claude/skills
```

Clone the GitHub repository:

```
git clone https://github.com/anthropics/skills.git
```

This will create:

```
~/.claude/skills/skills/
```

### 5\. Step 3 — Verify Skill Structure

A typical skill contains:

```
skills/
  ├── skill.json
  ├── instructions.md
  ├── templates/
  └── workflows/
```

Make sure:

- `skill.json` exists

- Required metadata is defined

- No dependency errors exist


### 6\. Step 4 — Restart Claude Code

Claude Code loads skills at startup.

After installation:

1. Close Claude Code

2. Reopen it

Or restart via CLI:

```
claude restart
```


### 7\. Step 5 — Activate the Skill

Once installed, you can activate a skill using:

```
/use skill-name
```

Example:

```
/use api-review
```

Claude will now apply that skill’s structured workflow.

### 8\. Updating Skills

To update a skill:

```
cd ~/.claude/skills/skills
git pull
```

Restart Claude Code afterward.


### 9\. Removing a Skill

Simply delete its folder:

```
rm -rf ~/.claude/skills/skills
```

Restart Claude Code.

---

# Practical Usage: How to Use Skills in Claude Code

## 1\. How to use skills in Claude code 

Skills in Claude Code are modular capability packages that guide the model to follow specific workflows or domain knowledge. Using them effectively starts with understanding your project and identifying the tasks you want Claude to help with.

First, analyze your project context and determine the types of tasks involved, such as frontend design, API review, testing, or documentation. Based on these needs, select the relevant skills that match the workflow you want Claude to follow.

Once you know which skills are appropriate, you can simply reference the skill name directly in your prompt. Claude Code will then apply the structured instructions and methodology defined by that skill.

For example:

```plain
Please use frontend-design to review the UX of this dashboard.
Focus particularly on layout hierarchy, usability, and responsive design (RWD).
```

In this example, Claude will apply the guidance embedded in the **frontend-design skill**, allowing it to produce more structured and relevant feedback compared to a general prompt.

This approach helps standardize workflows and ensures Claude follows consistent best practices when performing common development tasks.

---

## 2\. Bonus: How to Build Your Own Skills

One of the most powerful features of Claude Code is the ability to create **custom skills** tailored to your own workflows.

A typical skill consists of structured instructions that define how Claude should approach a specific task. This allows teams to encode their internal best practices into reusable AI workflows.

### Step 1 — Create a Skill Folder

Skills are stored locally in the Claude skills directory:

```plain
~/.claude/skills/
```

### Step 2 — Define the Skill Instructions

Inside the folder, create an \`[instructions.md](instructions.md)\` file. \
This file describes how Claude should behave when the skill is invoked.

Example:

```markdown

# Frontend Design SkillYou are a senior frontend designer.
When reviewing a UI:
1. Evaluate layout structure and visual hierarchy
2. Check responsive behavior (RWD)
3. Identify usability issues
4. Suggest improvements following modern UI patterns
```

### Step 3 — Add Skill Metadata (Optional)

You can also include a `skill.json` file to describe the skill:

```json
{
  "name": "frontend-design",
  "description": "Review UI/UX and responsive design for frontend interfaces"
}
```

### Step 4 — Use the Skill in Claude Code

Once the skill is created, you can reference it in your prompts:

```
Use `frontend-design` to review this dashboard layout and suggest improvements.
```

Claude will automatically apply the structured guidance defined in the skill.

---

### Why Custom Skills Are Powerful

Custom skills allow teams to:

- Standardize development workflows

- Encode design and engineering best practices

- Improve consistency in AI-assisted development

- Reduce repetitive prompting

Over time, teams can build a **library of internal skills** for tasks such as code review, CRO analysis, API design, and documentation generation.

---

## Conclusion:

Claude Code has evolved significantly since the first time I used it in mid-2025. Returning to it during my internship at ABConvert reminded me how powerful an AI-native development workflow can be when the right tools and practices are in place.

Among these features, **Skills** stand out as one of the most important concepts. Instead of repeatedly writing long prompts, developers can encapsulate structured workflows, best practices, and domain knowledge into reusable modules. This not only improves consistency and reliability, but also allows teams to gradually build their own internal AI tooling ecosystem.

In practice, Skills transform Claude Code from a simple coding assistant into something closer to a **programmable development collaborator**. As teams create their own skills—for example for code review, CRO analysis, or API design—they can encode their engineering standards directly into the AI workflow.

For AI-native companies like ABConvert, this approach makes AI not just a helper, but a **first-class part of the development process**.

I hope this short introduction helps you better understand what Claude Skills are and how you can start using them in your own workflow.
