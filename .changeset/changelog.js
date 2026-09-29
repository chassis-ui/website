// The changelog entries of @chassis-ui/docs. The default of Changesets starts each entry with
// the hash of the commit that added the changeset. The older entries of the changelog have
// none, and neither do these.

export default {
  getReleaseLine(changeset) {
    const [firstLine, ...otherLines] = changeset.summary.split('\n').map((line) => line.trimEnd())

    return [`- ${firstLine}`, ...otherLines.map((line) => (line ? `  ${line}` : ''))].join('\n')
  },
  // The package has no dependency inside this repository.
  getDependencyReleaseLine() {
    return ''
  }
}
