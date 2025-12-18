@echo off
echo ================================================
echo Automated Thesis Converter
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed!
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Check if python-docx is installed
python -c "import docx" >nul 2>&1
if errorlevel 1 (
    echo Installing python-docx package...
    pip install python-docx
    if errorlevel 1 (
        echo Error: Failed to install python-docx!
        pause
        exit /b 1
    )
)

REM Run the conversion script
echo Converting your thesis to professional DOCX format...
echo.
python convert_thesis.py

echo.
echo ================================================
echo Conversion process completed!
echo ================================================
echo.
echo Your thesis has been saved as: Sweet_Dessert_Thesis_Automated.docx
echo.
echo Next steps:
echo 1. Open the DOCX file in Microsoft Word
echo 2. Add page numbers and generate TOC if needed
echo 3. Review formatting and make final adjustments
echo.
pause
