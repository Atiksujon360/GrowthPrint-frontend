# 🔳 Common Commands

Commands for starting the application, stopping it, and running tests. All commands are configured in `{{CONTEXT_ROOT}}/testskill.config.toml` to keep this skill system-agnostic.

---

## Application Commands

### Start the Application

To start the application for testing or page inspection, use the command specified in:

**Config key:** `commands.app_start_command`

### Stop the Application

To stop the application (if required), use the command specified in:

**Config key:** `commands.app_stop_command`

---

## Test Commands

### Run Tests

To run the test suite, use the command specified in:

**Config key:** `commands.test_run_command`

---

## Application URLs

### Frontend URL

When navigating to pages for testing or analysis:

**Config key:** `app.app_url`

---

## Test Artifacts Location

Where to save test plans, app analysis, and other artifacts:

**Config keys:**

- `paths.test_context_root_folder` - Base folder for test artifacts
- `paths.test_context_folder_name_template` - Name of the artifacts folder

---

## Quick Reference

| Purpose          | Config Key                       |
| ---------------- | -------------------------------- |
| Start app        | `commands.app_start_command`     |
| Stop app         | `commands.app_stop_command`      |
| Run tests        | `commands.test_run_command`      |
| App URL          | `app.app_url`                    |
| Artifacts path   | `paths.test_context_root_folder` |
| Artifacts folder | `paths.test_context_folder_name_template` |
