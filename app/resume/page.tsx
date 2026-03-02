import { db } from "@/lib/db";
import { resumeProfiles } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Star } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const profiles = db.select().from(resumeProfiles).all();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume Profiles
          </h1>
          <p className="text-sm text-muted-foreground">
            {profiles.length} profile{profiles.length !== 1 ? "s" : ""}. The default is used for fit scoring.
          </p>
        </div>
        <Link href="/resume/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Profile
          </Button>
        </Link>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              No resume profiles yet. Add your base resume to start scoring jobs.
            </p>
            <Link href="/resume/new">
              <Button size="sm">Add Resume</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => {
            const skills: string[] = JSON.parse(profile.skills ?? "[]");
            return (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {profile.label}
                        {profile.isDefault && (
                          <Badge variant="success" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                      {profile.headline && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {profile.headline}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {profile.yearsExperience && (
                        <span>{profile.yearsExperience}+ yrs</span>
                      )}
                      {profile.targetRoleLevel && (
                        <Badge variant="outline" className="capitalize">
                          {profile.targetRoleLevel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {skills.length > 0 && (
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 12).map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {skills.length > 12 && (
                        <Badge variant="outline">+{skills.length - 12} more</Badge>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
