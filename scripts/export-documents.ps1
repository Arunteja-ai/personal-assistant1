$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$docsRoot = Join-Path $root "docs\html"
$deliverableRoot = Join-Path $root "deliverables\ErNO_Class"
$componentsRoot = Join-Path $deliverableRoot "Project Components"

New-Item -ItemType Directory -Force -Path $componentsRoot | Out-Null

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

function Export-HtmlDocument {
  param(
    [string]$SourceHtml,
    [string]$PdfTarget,
    [string]$DocxTarget
  )

  [string]$absoluteSource = (Resolve-Path $SourceHtml).Path
  [string]$absolutePdf = Join-Path $root $PdfTarget
  [string]$absoluteDocx = if ($DocxTarget) { Join-Path $root $DocxTarget } else { $null }

  $document = $word.Documents.Open($absoluteSource)

  if ($absoluteDocx) {
    $document.SaveAs2($absoluteDocx, 16) | Out-Null
  }

  $document.SaveAs2($absolutePdf, 17) | Out-Null
  $document.Close()
}

try {
  Export-HtmlDocument -SourceHtml (Join-Path $docsRoot "frontend-guide.html") -PdfTarget "deliverables\ErNO_Class\Project Components\Frontend PDF.pdf"
  Export-HtmlDocument -SourceHtml (Join-Path $docsRoot "backend-guide.html") -PdfTarget "deliverables\ErNO_Class\Project Components\Backend PDF.pdf"
  Export-HtmlDocument -SourceHtml (Join-Path $docsRoot "authentication-guide.html") -PdfTarget "deliverables\ErNO_Class\Project Components\Authentication PDF.pdf"
  Export-HtmlDocument -SourceHtml (Join-Path $docsRoot "final-report.html") -PdfTarget "deliverables\ErNO_Class\Final Project Report.pdf" -DocxTarget "deliverables\ErNO_Class\Final Project Report.docx"
}
finally {
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}

Write-Output "Document export complete."
