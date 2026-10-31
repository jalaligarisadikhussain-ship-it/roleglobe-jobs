/* RoleGlobe optional outstream video inventory: disabled until approved.
 * Provider-supplied iframe embeds only. VAST tags and scripts need separate
 * network-specific implementation; do not substitute or guess ad code.
 */
window.RG_VIDEO_AD = Object.freeze({
  enabled:false,
  provider:'none',
  status:'awaiting-publisher-approval',
  mode:'provider-iframe',
  publisherApproved:false,
  categoryExclusionsConfirmed:false,
  mutedPlaybackVerified:false,
  closeControlVerified:false,
  explicitConsentRequired:true,
  embedUrl:'',
  embedHost:'',
  placement:'after-job-results'
});
