
variable "branch_name" {
  type = string
}

variable "name" {
  type    = string
  default = "did-book"
}

variable "repo" {
  type    = string
  default = "trackback-blockchain/did-book.git"
}

variable "key_name" {
  type    = string
  default = "ec2_key"
}

variable "git_token" {
  type    = string
  default = "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"
}

variable "cloud_watch_name" {
  type    = string
  default = "did-book"
}

variable "target_group_arn" {
  type    = string
  default = "arn:aws:elasticloadbalancing:ap-southeast-2:533545012068:targetgroup/did-book/3b26993737ec5081"
}
