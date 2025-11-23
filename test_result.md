#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Optimizare funcționalitate backup/restore în admin panel - restore-ul este prea lent și dă timeout în producție"

backend:
  - task: "Optimizare endpoint /api/admin/backup/restore cu operații bulk și batch processing"
    implemented: true
    working: "NA"
    file: "/app/backend/routers/backup.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          Implementat optimizări majore pentru restore:
          1. Adăugat batch processing cu BATCH_SIZE=1000 pentru colecții mari
          2. Optimizat Orders restore - înlocuit loop cu N queries cu o singură query folosind $in operator
          3. Adăugat progress tracking detaliat pentru fiecare colecție
          4. Implementat funcție helper batch_insert pentru procesare în loturi
          5. Adăugat câmp 'progress' în răspunsul API cu detalii granulare
          6. Îmbunătățit error handling și logging
          
          Optimizări specifice:
          - Categories: bulk insert cu batching
          - Products: bulk insert cu batching  
          - Reviews: bulk insert cu batching
          - Orders: query unică pentru verificare existență + bulk insert
          
          Rezultat așteptat: Reduce timpul de restore de la timeout la câteva secunde/minute chiar și pentru volume mari de date

frontend:
  - task: "Adăugare UI pentru progres în timp real și feedback detaliat pentru restore"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/admin/Backup.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          Implementat îmbunătățiri UI pentru restore:
          1. Adăugat state 'restoreProgress' pentru tracking status în timp real
          2. Crescut timeout la 5 minute (300000ms) pentru fișiere mari
          3. Afișare progress box colorat în funcție de status (success/error/warning/processing)
          4. Afișare detalii granulare din backend (lista de progress)
          5. Îmbunătățit mesajele de eroare cu detalii complete
          6. Progress box se ascunde automat după 10 secunde
          7. Indicatori vizuali pentru fiecare status (CheckCircle, AlertCircle, spinner)
          
          UI Progress states:
          - processing: albastru cu spinner
          - success: verde cu CheckCircle
          - warning: portocaliu cu AlertCircle
          - error: roșu cu AlertCircle

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "Optimizare endpoint /api/admin/backup/restore cu operații bulk și batch processing"
    - "Adăugare UI pentru progres în timp real și feedback detaliat pentru restore"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Am implementat optimizările pentru funcționalitatea de backup/restore:
      
      BACKEND (/app/backend/routers/backup.py):
      - Înlocuit loop-ul cu N queries individuale pentru Orders cu o singură query bulk ($in operator)
      - Adăugat batch processing pentru toate colecțiile (BATCH_SIZE=1000)
      - Implementat progress tracking granular
      - Toate operațiile folosesc acum insert_many în batch-uri
      
      FRONTEND (/app/frontend/src/pages/admin/Backup.jsx):
      - Adăugat UI pentru progres în timp real
      - Crescut timeout la 5 minute pentru restore-uri mari
      - Afișare detalii complete despre ce s-a restaurat și eventuale erori
      
      Testing agent trebuie să testeze:
      1. Endpoint-ul /api/admin/backup/restore cu un fișier de backup valid
      2. Verificare că răspunsul conține câmpurile: restored, errors, progress, message
      3. Verificare că Orders nu se duplică (doar cele noi se adaugă)
      4. Performance: trebuie să fie mult mai rapid decât înainte
      5. Frontend: verificare că progress box-ul apare și afișează detaliile corect
      
      Este necesar teste cu:
      - Backup mic (câteva documente)
      - Backup mare (>1000 documente pe colecție) pentru a testa batching-ul
      - Backup cu ordere duplicate pentru a verifica logica de skip