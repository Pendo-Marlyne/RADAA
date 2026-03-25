# RADAA
# 🇰🇪 RADAA — Raia Wanaharakati Civic Engagement Platform

> **Transforming civic awareness into community action.**  
> A fully interactive, front-end civic web application built for Nairobi's citizens and NGOs.
 

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [File Structure](#file-structure)
- [How to Run](#how-to-run)
- [Pages & Functionality](#pages--functionality)
- [Design System](#design-system)
- [Interactivity Guide](#interactivity-guide)
- [Badge System](#badge-system)
- [Streak System](#streak-system)

# Overview

**RADAA** (Raia Wanaharakati — meaning Active Citizens in Kiwahili) is a civic engagement platform that connects Nairobi residents to real-time community activities. It enables citizens to:

- Report infrastructure and social issues
- Join community events and food aid drives
- Engage with voter awareness campaigns
- Support NGO programs
- Track their personal civic impact through streaks, badges, and dashboards

The platform is entirely **front-end** —
. All data lives in JavaScript's `state` object during the session.

The colour scheme is directly inspired by the Kenyan national flag(red, green, black, and gold/shield), representing national identity and community solidarity.

# Features

 Feature -> Description 

 Simulated Login -> Choose Citizen or NGO role enter name and area 
 Gain access to Live Feed Real-time civic activity stream with auto-refresh every 45 seconds 
 Support Posts -> Click to support any post counter updates live 
 Join Events -> Join community events  tracked in your dashboard 
 Report Issues -> Post infrastructure or social issues directly 
 Edit & Delete -> Edit or delete your own posts 
 Charts -> Pie, bar, and doughnut charts using Chart.js
 Streak System -> Daily streak tracks consecutive active days lomited to 28 days
 Year Calendar -> GitHub-style full year calendar showing every active day 
 Badge System -> 10 unlockable badges earned through civic participation 
 Profile Dashboard -> Personal stats, level, streak and activity breakdown 
  NGO Hub -> Browse and support Nairobi NGOs (NGO role) 
  Responsive -> Works on mobile, tablet, and desktop 
  Dark Theme ->  Kenyan identity inspired dark colour palette with shadows reflecting green and red

# File Structure

radaa
 index.html -> HTML structure — all pages, modals, nav and footer
style.css -> All styling — colours, layout, components and responsiveness
script.js -> All logic — state, interactivity, charts, streak and badges

> All three files are *separate* and *independent* 
The index.html code has some in-line styling elements


# How to Run

# Open directly in browser
1. Download all three files into the same folder
2. Double-click *`index.html'* in browser


## Pages & Functionality

# Home Page
- Hero section with live activity ticker
- Trending civic posts from Nairobi
- Animated stat counters (issues, votes, events, NGOs)
- Three Chart.js charts: categories, weekly activity, area participation
- Four civic pillars: Voting, Issues, Food Aid, Social Impact

# Live Feed
- Scrollable stream of all civic activity
- Filter by: All / Voting / Issues / Food Aid / Events / Health
- Each post shows support ❤️ count and join ✅ status
- Your own posts show edit ✏️ and delete 🗑️ buttons
- New posts arrive automatically every 45 seconds
- Sidebar: live alerts + top active areas

# Dashboard
- 4 stat cards: Reports / Votes / Events / Supported 
- Line chart — your 7-day activity built from activeDays
- Badge grid — all 10 badges, locked and unlocked state
- Recent actions log — history of what you've done
- Full year streak calendar — every day of the year

# Profile
- Large avatar, name, role and area
- Earned badge chips displayed
- Impact stats with animated progress bars
- Fire streak card with personalised message
- Activity breakdown doughnut chart
- Level and Congrats card: Getting Started → Mwananchi wa Mwaka!
- Edit profile modal

# NGO Hub (NGO role only)
- 6 Nairobi NGO cards
- Click Support → counts as a civic action, updates your dashboard

# Design System

| Token -> Value |
| Primary background | `#0d0f0e` |
| Card background | `#181c1a` |
| Kenyan Red | `#E8001A` |
| Kenyan Green | `#00A550` |
| Shield Gold | `#C8A84B` |
| Text primary | `#f0ede6` |
| Text secondary | `#9ea89c` |
| Border | `rgba(255,255,255,0.07)` |
| Display font | Syne (Google Fonts) |
| Body font | DM Sans (Google Fonts) |


# Interactivity Guide

 What you click -> What happens 

❤️ Support button -> Post count goes up, your "Supported" stat increases, log entry added and badge is checked 
 ✅ Join button -> Event count goes up, your "Events" stat increases, voting events also increment Votes 
🚨 Post Activity → Issue Your "Reports" count goes up and post appears at top of feed
🌱 Post Activity → Event Post appears, general action logged 
✏️ Edit -> Modal pre-filled with post data, saved in place 
🗑️ Delete -> Post removed from DOM and state 
 NGO Support -> Counts as a Supported action and updates all counters 
 Any action -> Streak may increment, badges auto-check, profile updates live |

# Badge System

 Badge -> Requirement 

🌱 Civic Seed -> Take your first action 
🗳️ Voter -> Engage with a voting event 
🚨 Watchdog -> Report 2 issues 
🤝 Helper -> Support 3 posts 
✅ Joiner -> Join 2 community events 
⭐ Rising Star -> Complete 5 total actions 
🔥 Streaker -> Reach a 3-day streak 
🏆 Champion -> 10 total actions 
🦁 Simba -> 20 total actions 
🇰🇪 Mwananchi -> 30 total actions LEGEND 

---

# Streak System

The streak tracks how many *consecutive calendar days*you were active on the platform.

- Every action (support, join, report and post) marks today as active
- The streak count = consecutive active days from today backwards
- Gap of even one day resets the streak
- Today's square on the year calendar shows in *gold*
- Active past days show in *green*
- The profile streak card shows a personalised message based on streak length

---

# Credits

**Built for:** Civic Engagement & Nairobi Community  
**Colour Palette:** Kenyan National Flag (Red, Green and Black)  and Gold

**Motto:** *KAA RADAA— Stay Woke* 

*RADAA — Raia Wanaharakati. Active Citizens. Community Action.*

![Screenshot_25-3-2026_11509_127 0 0 1](https://github.com/user-attachments/assets/336ee09f-0c74-4e49-97c8-4ce422850749)

